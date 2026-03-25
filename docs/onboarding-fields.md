# Onboarding fields

Use one shared onboarding link for every signed-in user. These are the canonical fields the site should collect before AI generation:

- `name`
- `phone`
- `whatsapp`
- `company`
- `designation`
- `headline`
- `about`
- `website`
- `instagram`
- `linkedin`
- `meetingLink`
- `address`
- `servicesText`
- `experienceText`
- `educationText`
- `galleryText`
- `documentLinksText`
- `targetAudience`
- `goals`
- `stylePrompt`

How they map:

- identity and contact data update `public.users` and `public.portfolios`
- structured multiline fields become arrays for `services`, `experience`, `education`, and `gallery`
- document links and extra AI context are preserved in `portfolio_builds.intake_payload`
- `stylePrompt` becomes the build instruction sent to DeepSeek
