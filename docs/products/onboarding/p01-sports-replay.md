# P01 — Sports Replay / quadra recording — onboarding

Baseline: docs/context/product/quadras-gravacao-spec.md
Status: baseline → interview

This product already has the most mature discovery specification in the portfolio. The interview should focus on resolving the remaining business, operational and deployment decisions rather than re-asking settled technical intent.

## What we already understand

- Reusable solution for clubs/academies where a player requests a clip using a physical button.
- Continuous video buffer, configurable pre-roll/post-roll and independent overlapping clips.
- Local/offline operation is primary; cloud is optional.
- Installation is independent from IA Factory's operational availability.
- Hardware is adaptable by installation profile.
- The club/academy is the paying customer.
- Potential offer includes hardware, installation, software, maintenance, storage and support.
- The system is explicitly not an AI vision/facial-recognition/social platform in the initial scope.

## Interview goals

1. Define the real customer journey and buying trigger.
2. Clarify what is included in a standard installation.
3. Define installation profiles and supported variants.
4. Establish the operational support model.
5. Define the commercial packaging.
6. Resolve remaining access/reservation/cloud decisions.
7. Identify what must be validated in the first physical pilot.

## Questions

### A. Customer and value

- What exact problem makes a club/academy willing to pay?
- Who normally requests the solution: owner, manager, coach, player, or another role?
- Is the primary value the recording itself, convenience, player experience, retention, or another outcome?
- What is the minimum experience that makes the product worth installing?
- Is payment expected per court, per location, per month, per installation, or another model?

### B. Installation

- What is the smallest commercially sensible installation?
- What physical constraints are common?
- Who supplies power/network/cabling?
- Who installs and who maintains?
- How much variation between courts should the product tolerate?
- Which hardware combinations should become approved profiles?

### C. Player experience

- How should the player know that the clip was captured?
- How quickly should it become available?
- Is QR the default access mechanism?
- Does the player need to identify themselves or the reservation?
- What happens when several players press the button close together?

### D. Operations

- Who receives alerts?
- What should happen automatically after camera/button/storage/network failure?
- How much remote support is expected?
- Is centralized telemetry allowed, and what data should remain strictly local?

### E. Commercial packaging

- What is the standard package?
- Which items are optional?
- Is hardware sold, rented, or bundled?
- Is cloud storage an add-on?
- Is maintenance recurring?
- What service level is expected?

### F. Pilot acceptance

- What exact physical setup should be treated as the first reference installation?
- Which failure scenarios are mandatory before installation?
- What evidence is sufficient to call the pilot successful?

## Decisions to capture

- standard installation profile;
- commercial package;
- access model;
- cloud policy;
- reservation integration policy;
- support/maintenance model;
- first pilot acceptance criteria.


## Interview protocol for this product

Start each material topic with an OPEN question. Use the standard question bank for CLARIFY → SCENARIO → CONSTRAINT → EVIDENCE follow-ups. When a decision must be made, use SINGLE/MULTI choices only after the alternatives are understood, always allowing Other or Unknown/validate.

### Decision lenses
- installation profile: standard / mixed profiles / customer-specific / unknown;
- commercial model: one-time / subscription / hardware + recurring / managed service / mixed / unknown;
- deployment ownership: customer / IA Factory / third party / mixed / unknown;
- evidence maturity: production / pilot / prototype / reported / assumption / none.

Record the selected option as a decision only when explicitly chosen; otherwise classify it as reported or open.

See docs/products/onboarding/question-bank.md for reusable answer options and scenario prompts.
