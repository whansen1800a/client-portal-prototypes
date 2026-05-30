# Transaction–Invoice Auto-Match Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically match incoming Finicity/Plaid transactions to unpaid invoices by amount, customer name, and date window — marking the invoice paid, logging the match, and allowing the bookkeeper to unlink from either side.

**Architecture:** An event-driven pipeline: after every sync (Finicity or Plaid), a `InvoiceMatchMessage` is dispatched to a RabbitMQ topic queue. `InvoiceMatchConsumer` runs `InvoiceTransactionMatcherService`, which queries unpaid invoices, applies a 3-step filter (exact amount, fuzzy name, ±30-day date window), creates `InvoiceTransactionMatch` records, and marks matched invoices paid. Three new REST endpoints expose list/trigger/unlink to the frontend. Both the Transactions page and Invoices page show the match link with an unlink button.

**Tech Stack:** PHP 7/Symfony, Doctrine ORM (PostgreSQL), OldSound RabbitMQ bundle, React/TypeScript, Axios service pattern

---

## Task 1: InvoiceTransactionMatch Doctrine Entity

**Files:**
- Create: `portal-apis/src/ClientPortal/BookkeepingBundle/Entity/InvoiceTransactionMatch.php`
- Create: `portal-apis/src/ClientPortal/BookkeepingBundle/Resources/config/doctrine/InvoiceTransactionMatch.orm.yml`
- Create: `portal-apis/src/ClientPortal/BookkeepingBundle/Repository/EntityRepository/InvoiceTransactionMatchRepository.php`

**Context:** The `InvoicePayments` entity and its ORM mapping at `Entity/InvoicePayments.php` + `doctrine/InvoicePayments.orm.yml` are the closest existing pattern — model these files on them.

**Step 1: Create the entity class**

```php
<?php
// portal-apis/src/ClientPortal/BookkeepingBundle/Entity/InvoiceTransactionMatch.php

namespace ClientPortal\BookkeepingBundle\Entity;

use _1800Accountant\lib\Entity\GenericUUIDId;
use App\AppBundle\Model\CreatedUpdatedDateTimeTrait;
use ClientPortal\BusinessBundle\Entity\Business;

class InvoiceTransactionMatch
{
    use CreatedUpdatedDateTimeTrait;

    const MATCHED_BY_AUTO   = 'auto';
    const MATCHED_BY_MANUAL = 'manual';

    /** @var GenericUUIDId */
    protected $id;

    /** @var Invoice */
    protected $invoice;

    /** @var Transaction */
    protected $transaction;

    /** @var Business */
    protected $business;

    /** @var string */
    protected $matched_by;

    /** @var \DateTime */
    protected $matched_at;

    /** @var \DateTime|null */
    protected $unlinked_at;

    /** @var string|null */
    protected $unlinked_by;

    public function __construct(Invoice $invoice, Transaction $transaction, Business $business, string $matchedBy = self::MATCHED_BY_AUTO)
    {
        $this->invoice     = $invoice;
        $this->transaction = $transaction;
        $this->business    = $business;
        $this->matched_by  = $matchedBy;
        $this->matched_at  = new \DateTime();
    }

    public function getId() { return $this->id; }
    public function getInvoice(): Invoice { return $this->invoice; }
    public function getTransaction(): Transaction { return $this->transaction; }
    public function getBusiness(): Business { return $this->business; }
    public function getMatchedBy(): string { return $this->matched_by; }
    public function getMatchedAt(): \DateTime { return $this->matched_at; }
    public function getUnlinkedAt(): ?\DateTime { return $this->unlinked_at; }
    public function getUnlinkedBy(): ?string { return $this->unlinked_by; }
    public function isActive(): bool { return $this->unlinked_at === null; }

    public function unlink(string $unlinkedBy): void
    {
        $this->unlinked_at = new \DateTime();
        $this->unlinked_by = $unlinkedBy;
    }
}
```

**Step 2: Create the ORM mapping**

```yaml
# portal-apis/src/ClientPortal/BookkeepingBundle/Resources/config/doctrine/InvoiceTransactionMatch.orm.yml

ClientPortal\BookkeepingBundle\Entity\InvoiceTransactionMatch:
    type: entity
    table: invoice_transaction_match
    repositoryClass: ClientPortal\BookkeepingBundle\Repository\EntityRepository\InvoiceTransactionMatchRepository
    id:
        id:
            type: generic_uuid_id
            generator:
                strategy: UUID
    fields:
        matched_by:
            type: string
            length: 10
            nullable: false
        matched_at:
            type: datetime
            nullable: false
        unlinked_at:
            type: datetime
            nullable: true
        unlinked_by:
            type: string
            length: 255
            nullable: true
        created:
            type: datetime
            column: created_at
            nullable: false
            gedmo:
                timestampable:
                    on: create
        updated:
            type: datetime
            column: updated_at
            nullable: false
            gedmo:
                timestampable:
                    on: update
    manyToOne:
        invoice:
            targetEntity: ClientPortal\BookkeepingBundle\Entity\Invoice
            joinColumns:
                invoice_id:
                    referencedColumnName: id
                    nullable: false
        transaction:
            targetEntity: ClientPortal\BookkeepingBundle\Entity\Transaction
            joinColumns:
                transaction_id:
                    referencedColumnName: id
                    nullable: false
        business:
            targetEntity: ClientPortal\BusinessBundle\Entity\Business
            joinColumns:
                business_id:
                    referencedColumnName: id
                    nullable: false
    indexes:
        itm_invoice_id_idx:
            columns: [ invoice_id ]
        itm_transaction_id_idx:
            columns: [ transaction_id ]
        itm_business_id_idx:
            columns: [ business_id ]
        itm_unlinked_at_idx:
            columns: [ unlinked_at ]
```

**Step 3: Create the repository**

```php
<?php
// portal-apis/src/ClientPortal/BookkeepingBundle/Repository/EntityRepository/InvoiceTransactionMatchRepository.php

namespace ClientPortal\BookkeepingBundle\Repository\EntityRepository;

use Doctrine\ORM\EntityRepository;
use ClientPortal\BookkeepingBundle\Entity\Invoice;
use ClientPortal\BookkeepingBundle\Entity\Transaction;
use ClientPortal\BookkeepingBundle\Entity\InvoiceTransactionMatch;
use ClientPortal\BusinessBundle\Entity\Business;

class InvoiceTransactionMatchRepository extends EntityRepository
{
    public function findActiveByTransaction(Transaction $transaction): ?InvoiceTransactionMatch
    {
        return $this->createQueryBuilder('m')
            ->where('m.transaction = :transaction')
            ->andWhere('m.unlinked_at IS NULL')
            ->setParameter('transaction', $transaction)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findActiveByInvoice(Invoice $invoice): ?InvoiceTransactionMatch
    {
        return $this->createQueryBuilder('m')
            ->where('m.invoice = :invoice')
            ->andWhere('m.unlinked_at IS NULL')
            ->setParameter('invoice', $invoice)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return InvoiceTransactionMatch[] */
    public function findRecentActiveForBusiness(Business $business, int $limit = 50): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.business = :business')
            ->andWhere('m.unlinked_at IS NULL')
            ->orderBy('m.matched_at', 'DESC')
            ->setMaxResults($limit)
            ->setParameter('business', $business)
            ->getQuery()
            ->getResult();
    }
}
```

**Step 4: Generate the migration**

Run from `portal-apis/`:
```bash
php bin/console doctrine:migrations:diff
```

Review the generated migration — verify it creates `invoice_transaction_match` table with the expected columns and indexes.

```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

Expected output: migration runs without error.

**Step 5: Commit**

```bash
git add src/ClientPortal/BookkeepingBundle/Entity/InvoiceTransactionMatch.php \
        src/ClientPortal/BookkeepingBundle/Resources/config/doctrine/InvoiceTransactionMatch.orm.yml \
        src/ClientPortal/BookkeepingBundle/Repository/EntityRepository/InvoiceTransactionMatchRepository.php \
        app/DoctrineMigrations/
git commit -m "feat: add InvoiceTransactionMatch entity, ORM mapping, and repository"
```

---

## Task 2: InvoiceRepository — findUnpaidCandidates Query

**Files:**
- Modify: `portal-apis/src/ClientPortal/BookkeepingBundle/Repository/EntityRepository/InvoiceRepository.php`

**Context:** `getUnpaidInvoiceCount()` at line 509 is an example of a business-scoped unpaid query. The new method needs to filter by amount (in cents), customer name, and a date window around `due_date`.

**Step 1: Write the PhpSpec test**

Create file `portal-apis/spec/ClientPortal/BookkeepingBundle/Repository/EntityRepository/InvoiceRepositorySpec.php`:

```php
<?php
namespace spec\ClientPortal\BookkeepingBundle\Repository\EntityRepository;

use PhpSpec\ObjectBehavior;

// NOTE: Repository specs that require a real EntityManager are typically
// integration-tested. Write a unit test for the method signature instead,
// and rely on the integration/functional test for query correctness.
class InvoiceRepositorySpec extends ObjectBehavior
{
    public function it_exists()
    {
        // Placeholder — repository constructor requires EntityManager,
        // which is wired via DI. Actual query is covered in functional tests.
        $this->shouldBeAnInstanceOf('Doctrine\ORM\EntityRepository');
    }
}
```

**Step 2: Add the method to InvoiceRepository**

Find the `getUnpaidInvoiceCount()` method around line 509 and add the new method after it:

```php
/**
 * Find unpaid invoices for a business that could match a given amount (in cents)
 * and whose due_date falls within $windowDays days of $transactionDate.
 *
 * @param Business $business
 * @param int      $amountInCents
 * @param \DateTime $transactionDate
 * @param int      $windowDays
 * @return Invoice[]
 */
public function findUnpaidCandidates(
    Business $business,
    int $amountInCents,
    \DateTime $transactionDate,
    int $windowDays = 30
): array {
    $from = (clone $transactionDate)->modify("-{$windowDays} days");
    $to   = (clone $transactionDate)->modify("+{$windowDays} days");

    return $this->createQueryBuilder('i')
        ->where('i.business = :business')
        ->andWhere('i.payment_status = :unpaid')
        ->andWhere('i.total_amount = :amount')
        ->andWhere('i.due_date BETWEEN :from AND :to')
        ->setParameter('business', $business)
        ->setParameter('unpaid', Invoice::PAYMENT_STATUS_UNPAID)
        ->setParameter('amount', $amountInCents)
        ->setParameter('from', $from)
        ->setParameter('to', $to)
        ->orderBy('i.due_date', 'ASC')
        ->getQuery()
        ->getResult();
}
```

Note: `total_amount` is the raw integer column (cents). The entity's `getTotalAmountInCents()` returns this value.

**Step 3: Run the spec**

From `portal-apis/`:
```bash
vendor/bin/phpspec run spec/ClientPortal/BookkeepingBundle/Repository/EntityRepository/InvoiceRepositorySpec.php
```

Expected: PASS (placeholder spec)

**Step 4: Commit**

```bash
git add src/ClientPortal/BookkeepingBundle/Repository/EntityRepository/InvoiceRepository.php \
        spec/ClientPortal/BookkeepingBundle/Repository/EntityRepository/InvoiceRepositorySpec.php
git commit -m "feat: add InvoiceRepository::findUnpaidCandidates query method"
```

---

## Task 3: InvoiceTransactionMatcherService

**Files:**
- Create: `portal-apis/src/ClientPortal/BookkeepingBundle/Service/InvoiceTransactionMatcherService.php`
- Create: `portal-apis/spec/ClientPortal/BookkeepingBundle/Service/InvoiceTransactionMatcherServiceSpec.php`

**Context:** This is the core matching algorithm. `Transaction::getAbsoluteAmount()` returns the amount in cents as a positive integer. `Invoice::getTotalAmountInCents()` returns total in cents. Customer name: `Transaction::getCustomerName()` vs `Invoice::getContactName()`. Date: `Transaction::getTransactionDate()` vs `Invoice::getDueDate()`. The existing `TransactionMatcher::isMatchingCustomerName()` uses `strcasecmp` — replicate that pattern here.

**Step 1: Write the failing spec**

```php
<?php
// portal-apis/spec/ClientPortal/BookkeepingBundle/Service/InvoiceTransactionMatcherServiceSpec.php

namespace spec\ClientPortal\BookkeepingBundle\Service;

use ClientPortal\BookkeepingBundle\Entity\Invoice;
use ClientPortal\BookkeepingBundle\Entity\InvoiceTransactionMatch;
use ClientPortal\BookkeepingBundle\Entity\Transaction;
use ClientPortal\BookkeepingBundle\Repository\EntityRepository\InvoiceRepository;
use ClientPortal\BookkeepingBundle\Repository\EntityRepository\InvoiceTransactionMatchRepository;
use ClientPortal\BusinessBundle\Entity\Business;
use Doctrine\ORM\EntityManager;
use PhpSpec\ObjectBehavior;

class InvoiceTransactionMatcherServiceSpec extends ObjectBehavior
{
    public function let(
        EntityManager $em,
        InvoiceRepository $invoiceRepo,
        InvoiceTransactionMatchRepository $matchRepo
    ) {
        $this->beConstructedWith($em, $invoiceRepo, $matchRepo, 30);
    }

    public function it_skips_transactions_that_already_have_an_active_match(
        Transaction $transaction,
        Business $business,
        InvoiceTransactionMatchRepository $matchRepo,
        InvoiceTransactionMatch $existingMatch
    ) {
        $matchRepo->findActiveByTransaction($transaction)->willReturn($existingMatch);

        $this->matchTransaction($transaction, $business)->shouldReturn(null);
    }

    public function it_returns_null_when_no_candidate_invoices_exist(
        Transaction $transaction,
        Business $business,
        InvoiceRepository $invoiceRepo,
        InvoiceTransactionMatchRepository $matchRepo
    ) {
        $matchRepo->findActiveByTransaction($transaction)->willReturn(null);
        $transaction->getAbsoluteAmount()->willReturn(10000);
        $transaction->getTransactionDate()->willReturn(new \DateTime('2026-01-15'));

        $invoiceRepo->findUnpaidCandidates($business, 10000, new \DateTime('2026-01-15'), 30)
            ->willReturn([]);

        $this->matchTransaction($transaction, $business)->shouldReturn(null);
    }

    public function it_returns_null_when_customer_names_do_not_match(
        Transaction $transaction,
        Business $business,
        Invoice $invoice,
        InvoiceRepository $invoiceRepo,
        InvoiceTransactionMatchRepository $matchRepo
    ) {
        $matchRepo->findActiveByTransaction($transaction)->willReturn(null);
        $transaction->getAbsoluteAmount()->willReturn(10000);
        $transaction->getTransactionDate()->willReturn(new \DateTime('2026-01-15'));
        $transaction->getCustomerName()->willReturn('Acme Corp');

        $invoice->getContactName()->willReturn('Totally Different Company');

        $invoiceRepo->findUnpaidCandidates($business, 10000, new \DateTime('2026-01-15'), 30)
            ->willReturn([$invoice]);

        $this->matchTransaction($transaction, $business)->shouldReturn(null);
    }

    public function it_creates_a_match_when_all_criteria_pass(
        Transaction $transaction,
        Business $business,
        Invoice $invoice,
        InvoiceRepository $invoiceRepo,
        InvoiceTransactionMatchRepository $matchRepo,
        EntityManager $em
    ) {
        $matchRepo->findActiveByTransaction($transaction)->willReturn(null);
        $transaction->getAbsoluteAmount()->willReturn(10000);
        $transaction->getTransactionDate()->willReturn(new \DateTime('2026-01-15'));
        $transaction->getCustomerName()->willReturn('Acme Corp');

        $invoice->getContactName()->willReturn('Acme Corp');

        $invoiceRepo->findUnpaidCandidates($business, 10000, new \DateTime('2026-01-15'), 30)
            ->willReturn([$invoice]);

        $invoice->setPaymentStatus(Invoice::PAYMENT_STATUS_PAID)->shouldBeCalled();
        $em->persist(\Prophecy\Argument::type(InvoiceTransactionMatch::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $result = $this->matchTransaction($transaction, $business);
        $result->shouldBeAnInstanceOf(InvoiceTransactionMatch::class);
    }

    public function it_skips_name_filter_when_transaction_has_no_customer_name(
        Transaction $transaction,
        Business $business,
        Invoice $invoice,
        InvoiceRepository $invoiceRepo,
        InvoiceTransactionMatchRepository $matchRepo,
        EntityManager $em
    ) {
        $matchRepo->findActiveByTransaction($transaction)->willReturn(null);
        $transaction->getAbsoluteAmount()->willReturn(10000);
        $transaction->getTransactionDate()->willReturn(new \DateTime('2026-01-15'));
        $transaction->getCustomerName()->willReturn(null);

        $invoiceRepo->findUnpaidCandidates($business, 10000, new \DateTime('2026-01-15'), 30)
            ->willReturn([$invoice]);

        $invoice->setPaymentStatus(Invoice::PAYMENT_STATUS_PAID)->shouldBeCalled();
        $em->persist(\Prophecy\Argument::type(InvoiceTransactionMatch::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $result = $this->matchTransaction($transaction, $business);
        $result->shouldBeAnInstanceOf(InvoiceTransactionMatch::class);
    }
}
```

**Step 2: Run spec to verify it fails**

```bash
vendor/bin/phpspec run spec/ClientPortal/BookkeepingBundle/Service/InvoiceTransactionMatcherServiceSpec.php
```

Expected: FAIL — class not found.

**Step 3: Write the implementation**

```php
<?php
// portal-apis/src/ClientPortal/BookkeepingBundle/Service/InvoiceTransactionMatcherService.php

namespace ClientPortal\BookkeepingBundle\Service;

use Doctrine\ORM\EntityManager;
use ClientPortal\BookkeepingBundle\Entity\Invoice;
use ClientPortal\BookkeepingBundle\Entity\Transaction;
use ClientPortal\BookkeepingBundle\Entity\InvoiceTransactionMatch;
use ClientPortal\BookkeepingBundle\Repository\EntityRepository\InvoiceRepository;
use ClientPortal\BookkeepingBundle\Repository\EntityRepository\InvoiceTransactionMatchRepository;
use ClientPortal\BusinessBundle\Entity\Business;

class InvoiceTransactionMatcherService
{
    const NAME_LEVENSHTEIN_THRESHOLD = 3;

    /** @var EntityManager */
    private $em;

    /** @var InvoiceRepository */
    private $invoiceRepo;

    /** @var InvoiceTransactionMatchRepository */
    private $matchRepo;

    /** @var int */
    private $windowDays;

    public function __construct(
        EntityManager $em,
        InvoiceRepository $invoiceRepo,
        InvoiceTransactionMatchRepository $matchRepo,
        int $windowDays = 30
    ) {
        $this->em          = $em;
        $this->invoiceRepo = $invoiceRepo;
        $this->matchRepo   = $matchRepo;
        $this->windowDays  = $windowDays;
    }

    /**
     * Attempt to match a single transaction to an unpaid invoice.
     * Returns the created match record, or null if no match found.
     */
    public function matchTransaction(Transaction $transaction, Business $business): ?InvoiceTransactionMatch
    {
        // Skip if already matched
        if ($this->matchRepo->findActiveByTransaction($transaction) !== null) {
            return null;
        }

        $amountInCents   = $transaction->getAbsoluteAmount();
        $transactionDate = $transaction->getTransactionDate();
        $customerName    = $transaction->getCustomerName();

        $candidates = $this->invoiceRepo->findUnpaidCandidates(
            $business,
            $amountInCents,
            $transactionDate,
            $this->windowDays
        );

        if (empty($candidates)) {
            return null;
        }

        // Apply customer name filter (skip if transaction has no customer name)
        if ($customerName !== null) {
            $candidates = array_filter($candidates, function (Invoice $invoice) use ($customerName) {
                return $this->namesMatch($customerName, $invoice->getContactName());
            });
        }

        if (empty($candidates)) {
            return null;
        }

        // Candidates are already ordered oldest-first by findUnpaidCandidates
        $invoice = reset($candidates);

        $match = new InvoiceTransactionMatch($invoice, $transaction, $business, InvoiceTransactionMatch::MATCHED_BY_AUTO);
        $invoice->setPaymentStatus(Invoice::PAYMENT_STATUS_PAID);

        $this->em->persist($match);
        $this->em->flush();

        return $match;
    }

    /**
     * Run matching for all unmatched transactions for a business.
     * Returns count of new matches created.
     */
    public function matchAllForBusiness(Business $business): int
    {
        // Fetch unmatched transactions: those with no active InvoiceTransactionMatch
        $qb = $this->em->createQueryBuilder();
        $transactions = $qb
            ->select('t')
            ->from(Transaction::class, 't')
            ->where('t.business = :business')
            ->andWhere(
                $qb->expr()->not(
                    $qb->expr()->exists(
                        $this->em->createQueryBuilder()
                            ->select('1')
                            ->from(InvoiceTransactionMatch::class, 'm')
                            ->where('m.transaction = t')
                            ->andWhere('m.unlinked_at IS NULL')
                            ->getDQL()
                    )
                )
            )
            ->setParameter('business', $business)
            ->getQuery()
            ->getResult();

        $count = 0;
        foreach ($transactions as $transaction) {
            if ($this->matchTransaction($transaction, $business) !== null) {
                $count++;
            }
        }

        return $count;
    }

    private function namesMatch(?string $transactionName, ?string $invoiceName): bool
    {
        if ($transactionName === null || $invoiceName === null) {
            return false;
        }
        if (strcasecmp(trim($transactionName), trim($invoiceName)) === 0) {
            return true;
        }
        return levenshtein(strtolower(trim($transactionName)), strtolower(trim($invoiceName))) <= self::NAME_LEVENSHTEIN_THRESHOLD;
    }
}
```

**Step 4: Run spec to verify it passes**

```bash
vendor/bin/phpspec run spec/ClientPortal/BookkeepingBundle/Service/InvoiceTransactionMatcherServiceSpec.php
```

Expected: all examples PASS.

**Step 5: Commit**

```bash
git add src/ClientPortal/BookkeepingBundle/Service/InvoiceTransactionMatcherService.php \
        spec/ClientPortal/BookkeepingBundle/Service/InvoiceTransactionMatcherServiceSpec.php
git commit -m "feat: add InvoiceTransactionMatcherService with TDD specs"
```

---

## Task 4: RabbitMQ Message and Producer

**Files:**
- Create: `portal-apis/src/ClientPortal/BookkeepingBundle/RabbitMQ/Message/InvoiceMatchMessage.php`
- Create: `portal-apis/src/ClientPortal/BookkeepingBundle/RabbitMQ/Producer/InvoiceMatchProducer.php`

**Context:** Follow the exact pattern of `MonthlyManagementReportMessage.php` and `MonthlyManagementReportProducer.php`. The producer will use the `generic-tasks-exchange` (topic type) already defined in `app/config/config.yml` — same exchange used by `auto_trigger_sync_categorization`.

**Step 1: Create the message**

```php
<?php
// portal-apis/src/ClientPortal/BookkeepingBundle/RabbitMQ/Message/InvoiceMatchMessage.php

namespace ClientPortal\BookkeepingBundle\RabbitMQ\Message;

class InvoiceMatchMessage
{
    /** @var string */
    protected $businessId;

    public function __construct(string $businessId)
    {
        $this->businessId = $businessId;
    }

    public function getBusinessId(): string
    {
        return $this->businessId;
    }
}
```

**Step 2: Create the producer**

```php
<?php
// portal-apis/src/ClientPortal/BookkeepingBundle/RabbitMQ/Producer/InvoiceMatchProducer.php

namespace ClientPortal\BookkeepingBundle\RabbitMQ\Producer;

use ClientPortal\BookkeepingBundle\RabbitMQ\Message\InvoiceMatchMessage;
use OldSound\RabbitMqBundle\RabbitMq\ProducerInterface;
use PhpAmqpLib\Message\AMQPMessage;

class InvoiceMatchProducer
{
    const ROUTING_KEY      = 'invoice.match.run';
    const ROUTING_KEY_DEAD = 'dead.invoice.match.run';

    /** @var ProducerInterface */
    private $producer;

    public function __construct(ProducerInterface $producer)
    {
        $this->producer = $producer;
    }

    public function publish(string $businessId): void
    {
        $this->producer->publish(
            serialize(new InvoiceMatchMessage($businessId)),
            self::ROUTING_KEY
        );
    }

    public function sendToDeadMessageQueue(AMQPMessage $msg): void
    {
        $this->producer->publish($msg->body, self::ROUTING_KEY_DEAD);
    }
}
```

**Step 3: Register producer in services.yml**

Open `portal-apis/src/ClientPortal/BookkeepingBundle/Resources/config/services.yml` and add near the other RabbitMQ producers (near line 914):

```yaml
    client_portal_bookkeeping.invoice_match_producer:
        class: ClientPortal\BookkeepingBundle\RabbitMQ\Producer\InvoiceMatchProducer
        arguments:
            - '@old_sound_rabbit_mq.invoice_match_producer'
```

**Step 4: Add producer to config.yml**

Open `portal-apis/app/config/config.yml`. In the `producers:` block (around line 679), add after the `financial_reports` producer:

```yaml
        invoice_match:
            connection: default
            exchange_options: {name: 'generic-tasks-exchange', type: topic}
```

**Step 5: Commit**

```bash
git add src/ClientPortal/BookkeepingBundle/RabbitMQ/Message/InvoiceMatchMessage.php \
        src/ClientPortal/BookkeepingBundle/RabbitMQ/Producer/InvoiceMatchProducer.php \
        src/ClientPortal/BookkeepingBundle/Resources/config/services.yml \
        app/config/config.yml
git commit -m "feat: add InvoiceMatchMessage, InvoiceMatchProducer, and RabbitMQ producer config"
```

---

## Task 5: RabbitMQ Consumer

**Files:**
- Create: `portal-apis/src/ClientPortal/BookkeepingBundle/RabbitMQ/Consumer/InvoiceMatchConsumer.php`

**Context:** Follow the structure of `MonthlyManagementReportConsumer.php`. The consumer receives a serialized `InvoiceMatchMessage`, resolves the `Business` entity via the ORM entity manager, calls `InvoiceTransactionMatcherService::matchAllForBusiness()`, and returns `MSG_ACK`. On any exception it logs the error and returns `MSG_ACK` (not NACK, to prevent infinite requeue of poison messages — dead-letter queue handles retries at the broker level).

**Step 1: Write the consumer**

```php
<?php
// portal-apis/src/ClientPortal/BookkeepingBundle/RabbitMQ/Consumer/InvoiceMatchConsumer.php

namespace ClientPortal\BookkeepingBundle\RabbitMQ\Consumer;

use Doctrine\ORM\EntityManager;
use PhpAmqpLib\Message\AMQPMessage;
use Psr\Log\LoggerInterface;
use OldSound\RabbitMqBundle\RabbitMq\ConsumerInterface;
use ClientPortal\BookkeepingBundle\RabbitMQ\Message\InvoiceMatchMessage;
use ClientPortal\BookkeepingBundle\Service\InvoiceTransactionMatcherService;
use ClientPortal\BusinessBundle\Entity\Business;

class InvoiceMatchConsumer implements ConsumerInterface
{
    /** @var EntityManager */
    private $em;

    /** @var InvoiceTransactionMatcherService */
    private $matcherService;

    /** @var LoggerInterface */
    private $logger;

    public function __construct(
        EntityManager $em,
        InvoiceTransactionMatcherService $matcherService,
        LoggerInterface $logger
    ) {
        $this->em             = $em;
        $this->matcherService = $matcherService;
        $this->logger         = $logger;
    }

    public function execute(AMQPMessage $msg)
    {
        /** @var InvoiceMatchMessage $message */
        $message    = unserialize($msg->body);
        $businessId = $message->getBusinessId();

        $this->logger->info('InvoiceMatchConsumer: processing business', ['business_id' => $businessId]);

        try {
            $business = $this->em->getRepository(Business::class)->find($businessId);

            if (!$business) {
                $this->logger->warning('InvoiceMatchConsumer: business not found', ['business_id' => $businessId]);
                return self::MSG_ACK;
            }

            $count = $this->matcherService->matchAllForBusiness($business);
            $this->logger->info('InvoiceMatchConsumer: matched invoices', ['business_id' => $businessId, 'count' => $count]);

        } catch (\Exception $e) {
            $this->logger->error('InvoiceMatchConsumer: error', [
                'business_id' => $businessId,
                'error'       => $e->getMessage(),
            ]);
        }

        return self::MSG_ACK;
    }
}
```

**Step 2: Register consumer service in services.yml**

Add after the `monthly_management_report.email_consumer` block (around line 928):

```yaml
    client_portal_bookkeeping.invoice_match_consumer:
        class: ClientPortal\BookkeepingBundle\RabbitMQ\Consumer\InvoiceMatchConsumer
        arguments:
            - '@doctrine.orm.default_entity_manager'
            - '@client_portal_bookkeeping.invoice_transaction_matcher_service'
            - '@logger'
```

Also register the matcher service (add near the consumer definition):

```yaml
    client_portal_bookkeeping.invoice_transaction_matcher_service:
        class: ClientPortal\BookkeepingBundle\Service\InvoiceTransactionMatcherService
        arguments:
            - '@doctrine.orm.default_entity_manager'
            - '@client_portal_bookkeeping.invoice_repository'
            - '@client_portal_bookkeeping.invoice_transaction_match_repository'
            - 30
```

And register the new repository:

```yaml
    client_portal_bookkeeping.invoice_transaction_match_repository:
        class: ClientPortal\BookkeepingBundle\Repository\EntityRepository\InvoiceTransactionMatchRepository
        factory: ['@doctrine.orm.default_entity_manager', getRepository]
        arguments:
            - 'ClientPortal\BookkeepingBundle\Entity\InvoiceTransactionMatch'
```

**Step 3: Add consumer to config.yml**

In the `consumers:` block of `portal-apis/app/config/config.yml`, add after the `auto_trigger_sync_categorization` consumer:

```yaml
        invoice_match:
            connection: default
            exchange_options: {name: 'generic-tasks-exchange', type: topic}
            callback: client_portal_bookkeeping.invoice_match_consumer
            queue_options:
                name: invoice-match-queue
                routing_keys:
                    - 'invoice.match.run'
                arguments:
                    x-dead-letter-exchange: ['S', 'generic-tasks-exchange']
                    x-dead-letter-routing-key: ['S', 'dead.invoice.match.run']
                    x-message-ttl: ['I', 3600000]
            qos_options:
                prefetch_count: 1
            idle_timeout: 3600
            idle_timeout_exit_code: 0
```

**Step 4: Verify container compiles**

```bash
php bin/console cache:clear
php bin/console debug:container client_portal_bookkeeping.invoice_match_consumer
```

Expected: service definition printed without error.

**Step 5: Commit**

```bash
git add src/ClientPortal/BookkeepingBundle/RabbitMQ/Consumer/InvoiceMatchConsumer.php \
        src/ClientPortal/BookkeepingBundle/Resources/config/services.yml \
        app/config/config.yml
git commit -m "feat: add InvoiceMatchConsumer, register services and RabbitMQ consumer queue"
```

---

## Task 6: InvoiceMatchController and Routes

**Files:**
- Create: `portal-apis/src/ClientPortal/BookkeepingBundle/Controller/InvoiceMatchController.php`
- Modify: `portal-apis/src/ClientPortal/BookkeepingBundle/Resources/config/routing.yml`

**Context:** `InvoiceController.php` is the closest pattern. The base class is `BaseApiController`. Use `$this->getBusinessEntity()` and `$this->getORMManager()`. The `run-match` endpoint dispatches to RabbitMQ via `InvoiceMatchProducer`; it rate-limits via a simple cache key (use Symfony's `CacheInterface` or a Redis key — check what's available; if unclear, use a simple check on a database-persisted timestamp on the business).

For MVP simplicity, skip the rate limit implementation in the first pass — add a TODO comment and implement it as a follow-up.

**Step 1: Create the controller**

```php
<?php
// portal-apis/src/ClientPortal/BookkeepingBundle/Controller/InvoiceMatchController.php

namespace ClientPortal\BookkeepingBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use ClientPortal\BookkeepingBundle\Entity\Invoice;
use ClientPortal\BookkeepingBundle\Entity\InvoiceTransactionMatch;
use ClientPortal\BookkeepingBundle\RabbitMQ\Producer\InvoiceMatchProducer;
use ClientPortal\BookkeepingBundle\Repository\EntityRepository\InvoiceTransactionMatchRepository;
use ClientPortal\GenericBundle\Controller\BaseApiController;
use App\AppBundle\Exception\DocumentNotFoundException;

class InvoiceMatchController extends BaseApiController
{
    /**
     * List active invoice-transaction matches for this business.
     * Optional query param: ?invoice_id=X or ?transaction_id=X
     */
    public function listAction(Request $request)
    {
        /** @var InvoiceTransactionMatchRepository $repo */
        $repo = $this->getORMManager()->getRepository(InvoiceTransactionMatch::class);

        $invoiceId     = $request->query->get('invoice_id');
        $transactionId = $request->query->get('transaction_id');

        if ($invoiceId) {
            $invoice = $this->getORMManager()->getRepository(Invoice::class)
                ->getByIdForBusiness($invoiceId, $this->getBusinessEntity());
            if (!$invoice) throw new DocumentNotFoundException();
            $match = $repo->findActiveByInvoice($invoice);
            return $this->view($match ? [$match] : []);
        }

        $matches = $repo->findRecentActiveForBusiness($this->getBusinessEntity());
        return $this->view($matches);
    }

    /**
     * Trigger invoice matching for this business via RabbitMQ.
     * TODO: Add rate limiting (once per minute per business).
     */
    public function runMatchAction()
    {
        /** @var InvoiceMatchProducer $producer */
        $producer = $this->container->get('client_portal_bookkeeping.invoice_match_producer');
        $producer->publish((string) $this->getBusinessEntity()->getId());

        return $this->view(['status' => 'queued'], Response::HTTP_ACCEPTED);
    }

    /**
     * Unlink (soft-delete) an invoice-transaction match.
     * Reverts the invoice to 'unpaid' if no other active match exists for it.
     */
    public function unlinkAction(string $match_id)
    {
        /** @var InvoiceTransactionMatchRepository $repo */
        $repo = $this->getORMManager()->getRepository(InvoiceTransactionMatch::class);
        $match = $repo->find($match_id);

        if (!$match || !$match->isActive()) {
            throw new DocumentNotFoundException();
        }

        $userId = (string) $this->getUser()->getId();
        $match->unlink($userId);

        // Revert invoice to unpaid only if no other active match links to it
        $otherMatch = $repo->findActiveByInvoice($match->getInvoice());
        if ($otherMatch === null) {
            $match->getInvoice()->setPaymentStatus(Invoice::PAYMENT_STATUS_UNPAID);
        }

        $this->getORMManager()->flush();

        return $this->view(null, Response::HTTP_NO_CONTENT);
    }
}
```

**Step 2: Add routes to routing.yml**

Add at the end of `portal-apis/src/ClientPortal/BookkeepingBundle/Resources/config/routing.yml`:

```yaml
client_portal_bookkeeping_invoice_match_list:
    path: /api/account/{account_id}/business/{business_id}/invoice-match
    methods: [GET]
    defaults: { _controller: ClientPortalBookkeepingBundle:InvoiceMatch:list, _format: json }

client_portal_bookkeeping_invoice_match_run:
    path: /api/account/{account_id}/business/{business_id}/invoice/run-match
    methods: [POST]
    defaults: { _controller: ClientPortalBookkeepingBundle:InvoiceMatch:runMatch, _format: json }

client_portal_bookkeeping_invoice_match_unlink:
    path: /api/account/{account_id}/business/{business_id}/invoice-match/{match_id}
    methods: [DELETE]
    defaults: { _controller: ClientPortalBookkeepingBundle:InvoiceMatch:unlink, _format: json }
```

**Step 3: Verify routes are registered**

```bash
php bin/console debug:router | grep invoice-match
```

Expected: all 3 routes listed.

**Step 4: Commit**

```bash
git add src/ClientPortal/BookkeepingBundle/Controller/InvoiceMatchController.php \
        src/ClientPortal/BookkeepingBundle/Resources/config/routing.yml
git commit -m "feat: add InvoiceMatchController with list, run-match, and unlink endpoints"
```

---

## Task 7: Hook Dispatch Into Sync Pipeline

**Files:**
- Modify: `portal-apis/src/ClientPortal/BookkeepingImportBundle/Controller/FinicityController.php`

**Context:** The ORM sync path is `syncAllEntities()` at line 1710. After the `$this->getDm()->flush()` call near line 1757, dispatch the match event. The Finicity controller gets services via `$this->container->get(...)`. For Plaid, search for the equivalent sync endpoint in the same file or in `BankAccountController.php`.

**Step 1: Find the Plaid sync endpoint**

```bash
grep -n "plaid\|Plaid" portal-apis/src/ClientPortal/BookkeepingImportBundle/Controller/FinicityController.php | grep -i "sync\|action" | head -10
grep -rn "plaid.*sync\|sync.*plaid" portal-apis/src/ClientPortal/BookkeepingImportBundle/Controller/ | head -10
```

Note the exact line number(s) where sync completes for Plaid (look for `return $this->view(...)` after a flush).

**Step 2: Add dispatch after Finicity ORM sync**

In `FinicityController.php`, find the `syncAllEntities()` method. The `return $this->view($newBalances)` is near line 1757. Add the dispatch call just before that return:

```php
// Add this line before the final `return $this->view($newBalances);` in syncAllEntities()
$this->container->get('client_portal_bookkeeping.invoice_match_producer')
    ->publish((string) $businessDocument->getId());
```

**Step 3: Add dispatch after legacy Finicity sync (MongoDB path)**

In the same file, `syncAllAction()` at line 1647 ends with `return $this->view($newBalances)`. Add dispatch just before that return:

```php
// Add this line before the final `return $this->view($newBalances);` in syncAllAction()
$this->container->get('client_portal_bookkeeping.invoice_match_producer')
    ->publish((string) $this->getBusiness()->getId());
```

**Step 4: Add dispatch after Plaid sync**

Find and apply the same pattern to the Plaid sync endpoint(s) identified in Step 1.

**Step 5: Verify container can resolve the producer**

```bash
php bin/console debug:container client_portal_bookkeeping.invoice_match_producer
```

Expected: service definition printed.

**Step 6: Commit**

```bash
git add src/ClientPortal/BookkeepingImportBundle/Controller/FinicityController.php
# Add any other modified sync files
git commit -m "feat: dispatch InvoiceMatchMessage after each Finicity/Plaid sync"
```

---

## Task 8: Frontend — TypeScript Model and API Service

**Files:**
- Create: `portal-web-master/portal-web-master/src/models/invoice-match-models.ts`
- Create: `portal-web-master/portal-web-master/src/services/apiService/invoiceMatch.ts`

**Context:** Follow the exact pattern of `src/services/apiService/invoice.ts` — it uses `getResource`, `postResource`, `deleteResource` from `axiosService`, and reads `accountId`/`businessId` from the Redux store via `store.getState()`.

**Step 1: Create the TypeScript model**

```typescript
// portal-web-master/portal-web-master/src/models/invoice-match-models.ts

export interface InvoiceTransactionMatch {
    id: string;
    invoice: {
        id: string;
        number: string;
        total: string;
        payment_status: string;
    };
    transaction: {
        id: string;
        description: string;
        amount: string;
        date: number;
        bank_account: string;
    };
    matched_by: 'auto' | 'manual';
    matched_at: string;
    unlinked_at: string | null;
    unlinked_by: string | null;
}

export interface RunMatchResponse {
    status: 'queued';
}
```

**Step 2: Create the API service**

```typescript
// portal-web-master/portal-web-master/src/services/apiService/invoiceMatch.ts

import store from '../../store';
import { getResource, postResource, deleteResource } from '../axiosService';
import { InvoiceTransactionMatch, RunMatchResponse } from '../../models/invoice-match-models';

const getStoreData = () => {
    const { appData } = store.getState();
    const accountId = appData.current_account_id;
    const businessId = appData.current_business_id;
    const baseUrl = `api/account/${accountId}/business/${businessId}`;
    return { accountId, businessId, baseUrl };
};

export function getInvoiceMatches(params?: { invoice_id?: string; transaction_id?: string }) {
    const { baseUrl } = getStoreData();
    return getResource<InvoiceTransactionMatch[]>(`${baseUrl}/invoice-match`, undefined, params);
}

export function runInvoiceMatch() {
    const { baseUrl } = getStoreData();
    return postResource<RunMatchResponse>(`${baseUrl}/invoice/run-match`, {});
}

export function unlinkInvoiceMatch(matchId: string) {
    const { baseUrl } = getStoreData();
    return deleteResource(`${baseUrl}/invoice-match/${matchId}`);
}
```

**Step 3: Commit**

```bash
git add src/models/invoice-match-models.ts \
        src/services/apiService/invoiceMatch.ts
git commit -m "feat: add InvoiceTransactionMatch TypeScript model and API service"
```

---

## Task 9: Frontend — Transactions Page Match UI

**Files:**
- Modify: `portal-web-master/portal-web-master/src/components/bookkeeping/transactions/TransactionsList.tsx`
- Modify: `portal-web-master/portal-web-master/src/components/bookkeeping/transactions/Transactions.tsx`

**Context:** Read both files before editing to understand the existing row rendering and toolbar structure. The goal is:
1. In `TransactionsList.tsx` — add a "Matched: Invoice #X" chip per row when a match exists; clicking opens a small popover with invoice details and an Unlink button.
2. In `Transactions.tsx` — add a "Run Invoice Matching" button in the toolbar that calls `runInvoiceMatch()`, then polls `getInvoiceMatches()` every 3 seconds (up to 30s) and shows a snackbar with the result.

**Step 1: Read both files to understand current structure**

```bash
cat src/components/bookkeeping/transactions/Transactions.tsx
cat src/components/bookkeeping/transactions/TransactionsList.tsx
```

Note: look for where the toolbar buttons are rendered (search for `<Button` or `<IconButton`), and where each transaction row is rendered (look for `map` over a transactions array).

**Step 2: Add match state and fetch to Transactions.tsx**

Add the following inside the `Transactions` component:

```typescript
// Add near other state declarations
const [matchRunning, setMatchRunning] = useState(false);

const handleRunMatch = async () => {
    setMatchRunning(true);
    try {
        await runInvoiceMatch();
        // Poll for new matches (up to 30s, every 3s)
        let attempts = 0;
        const poll = setInterval(async () => {
            attempts++;
            const matches = await getInvoiceMatches();
            if (matches?.length > 0 || attempts >= 10) {
                clearInterval(poll);
                setMatchRunning(false);
                const msg = matches?.length > 0
                    ? `${matches.length} invoice(s) matched`
                    : 'No new matches found';
                // Use existing snackbar pattern from this component
                // e.g. setSnackbarMessage(msg) — check current component for snackbar state
            }
        }, 3000);
    } catch {
        setMatchRunning(false);
    }
};
```

Add the button in the toolbar area (where other action buttons like sync live):

```tsx
<Button
    variant="outlined"
    size="small"
    disabled={matchRunning}
    onClick={handleRunMatch}
>
    {matchRunning ? 'Matching...' : 'Run Invoice Matching'}
</Button>
```

**Step 3: Add match chip to TransactionsList.tsx**

Add match chip rendering inside each transaction row. First fetch matches on component mount:

```typescript
const [matchMap, setMatchMap] = useState<Record<string, InvoiceTransactionMatch>>({});

useEffect(() => {
    getInvoiceMatches().then((matches) => {
        const map: Record<string, InvoiceTransactionMatch> = {};
        matches?.forEach((m) => { map[m.transaction.id] = m; });
        setMatchMap(map);
    });
}, []);
```

Inside the row render, add a chip when a match exists:

```tsx
{matchMap[transaction.id] && (
    <Chip
        label={`Matched: Invoice #${matchMap[transaction.id].invoice.number}`}
        size="small"
        color="success"
        variant="outlined"
        onDelete={() => handleUnlink(matchMap[transaction.id].id, transaction.id)}
    />
)}
```

Add the unlink handler:

```typescript
const handleUnlink = async (matchId: string, transactionId: string) => {
    await unlinkInvoiceMatch(matchId);
    setMatchMap((prev) => {
        const next = { ...prev };
        delete next[transactionId];
        return next;
    });
};
```

**Step 4: Commit**

```bash
git add src/components/bookkeeping/transactions/Transactions.tsx \
        src/components/bookkeeping/transactions/TransactionsList.tsx
git commit -m "feat: add invoice match chip and run-match button to Transactions page"
```

---

## Task 10: Frontend — Invoices Page Match UI

**Files:**
- Modify: `portal-web-master/portal-web-master/src/components/bookkeeping/invoices/InvoiceList.tsx`
- Modify: `portal-web-master/portal-web-master/src/components/bookkeeping/invoices/InvoiceDetails.tsx`

**Context:** Read both files before editing. The goal is:
1. In `InvoiceList.tsx` — show an "Auto-matched" badge on invoices that have an active auto match (distinct from manually paid).
2. In `InvoiceDetails.tsx` — show matched transaction details and an Unlink button.

**Step 1: Read both files**

```bash
cat src/components/bookkeeping/invoices/InvoiceList.tsx
cat src/components/bookkeeping/invoices/InvoiceDetails.tsx
```

Note where `payment_status` is displayed and where invoice detail fields are rendered.

**Step 2: Add match fetch to InvoiceList.tsx**

```typescript
const [matchByInvoice, setMatchByInvoice] = useState<Record<string, InvoiceTransactionMatch>>({});

useEffect(() => {
    getInvoiceMatches().then((matches) => {
        const map: Record<string, InvoiceTransactionMatch> = {};
        matches?.forEach((m) => { map[m.invoice.id] = m; });
        setMatchByInvoice(map);
    });
}, []);
```

In the row where `payment_status` is shown, add:

```tsx
{matchByInvoice[invoice.id]?.matched_by === 'auto' && (
    <Chip label="Auto-matched" size="small" color="info" variant="outlined" />
)}
```

**Step 3: Add match detail and unlink to InvoiceDetails.tsx**

Fetch the match for the current invoice:

```typescript
const [match, setMatch] = useState<InvoiceTransactionMatch | null>(null);

useEffect(() => {
    if (invoice?.id) {
        getInvoiceMatches({ invoice_id: invoice.id }).then((matches) => {
            setMatch(matches?.[0] ?? null);
        });
    }
}, [invoice?.id]);
```

Render match info in the detail view:

```tsx
{match && (
    <Box mt={2} p={2} border={1} borderColor="success.main" borderRadius={1}>
        <Typography variant="subtitle2">Matched from transaction</Typography>
        <Typography variant="body2">
            Date: {new Date(match.transaction.date * 1000).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">Description: {match.transaction.description}</Typography>
        <Typography variant="body2">Amount: ${match.transaction.amount}</Typography>
        <Button
            size="small"
            color="warning"
            onClick={async () => {
                await unlinkInvoiceMatch(match.id);
                setMatch(null);
                // Trigger invoice reload to show status reverted to unpaid
                // Use existing reload pattern in this component
            }}
        >
            Unlink
        </Button>
    </Box>
)}
```

**Step 4: Commit**

```bash
git add src/components/bookkeeping/invoices/InvoiceList.tsx \
        src/components/bookkeeping/invoices/InvoiceDetails.tsx
git commit -m "feat: add auto-match badge and unlink to Invoices page"
```

---

## Task 11: End-to-End Smoke Test

**Goal:** Verify the full flow works: sync → match → display on both pages → unlink.

**Step 1: Start the RabbitMQ consumer locally**

```bash
# From portal-apis/
php bin/console rabbitmq:consumer invoice_match --messages=1
```

**Step 2: Trigger a sync for a test business that has at least one unpaid invoice**

Use the dev UI or call the sync API directly:
```
POST /api/account/{acc}/business/{biz}/bank_account/sync_all
```

**Step 3: Observe consumer output**

Expected log output:
```
InvoiceMatchConsumer: processing business [business_id]
InvoiceMatchConsumer: matched invoices {"business_id":"...","count":N}
```

**Step 4: Check the database**

```sql
SELECT * FROM invoice_transaction_match WHERE business_id = '...' AND unlinked_at IS NULL;
```

Expected: row(s) with `matched_by = 'auto'`.

**Step 5: Check the invoice status**

```sql
SELECT id, payment_status FROM invoice WHERE id = '...';
```

Expected: `payment_status = 'paid'` for matched invoices.

**Step 6: Load the Transactions page in the browser**

Expected: matched transaction rows show "Matched: Invoice #X" chip.

**Step 7: Load the Invoices page**

Expected: matched invoices show "Auto-matched" badge; invoice detail shows transaction info.

**Step 8: Test unlink from Transactions page**

Click the delete icon on the chip. Expected: chip disappears, invoice reverts to unpaid in the DB.

**Step 9: Test unlink from Invoices page**

Open a matched invoice detail, click Unlink. Expected: match info disappears, invoice status reverts to unpaid.

**Step 10: Commit any fixes found during smoke test**

```bash
git add -A
git commit -m "fix: smoke test corrections for invoice match flow"
```

---

## Reference: Key File Locations

| What | Where |
|---|---|
| Transaction entity | `portal-apis/src/ClientPortal/BookkeepingBundle/Entity/Transaction.php` |
| Invoice entity | `portal-apis/src/ClientPortal/BookkeepingBundle/Entity/Invoice.php` |
| InvoicePayments entity (pattern) | `portal-apis/src/ClientPortal/BookkeepingBundle/Entity/InvoicePayments.php` |
| InvoiceRepository | `portal-apis/src/ClientPortal/BookkeepingBundle/Repository/EntityRepository/InvoiceRepository.php` |
| TransactionRepository | `portal-apis/src/ClientPortal/BookkeepingBundle/Repository/EntityRepository/TransactionRepository.php` |
| Finicity sync (ORM path) | `portal-apis/src/ClientPortal/BookkeepingImportBundle/Controller/FinicityController.php:1710` |
| RabbitMQ consumer pattern | `portal-apis/src/ClientPortal/BookkeepingBundle/RabbitMQ/Consumer/MonthlyManagementReportConsumer.php` |
| RabbitMQ config | `portal-apis/app/config/config.yml:645` |
| services.yml | `portal-apis/src/ClientPortal/BookkeepingBundle/Resources/config/services.yml` |
| routing.yml | `portal-apis/src/ClientPortal/BookkeepingBundle/Resources/config/routing.yml` |
| Frontend API pattern | `portal-web-master/portal-web-master/src/services/apiService/invoice.ts` |
| Frontend models | `portal-web-master/portal-web-master/src/models/` |
