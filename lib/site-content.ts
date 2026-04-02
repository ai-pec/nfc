export const pricingPlans = [
  {
    name: "Solo",
    price: "Rs 999",
    description: "For freelancers and creators who need one elegant NFC profile card.",
    features: ["One NFC card", "Hosted profile", "Social links and contact actions"],
  },
  {
    name: "Pro",
    price: "Rs 1,999",
    description: "For professionals who want media, lead capture, and a stronger first impression.",
    features: ["Premium card finish", "Portfolio sections", "Private document sharing flow"],
  },
  {
    name: "Teams",
    price: "Custom",
    description: "For agencies, sales teams, and companies deploying cards across multiple people.",
    features: ["Bulk provisioning", "Subdomain management", "Admin controls and review flow"],
  },
] as const;

export const faqs = [
  {
    question: "Does the other person need an app to use the NFC card?",
    answer: "No. They just tap the card and the profile opens in the browser on supported phones.",
  },
  {
    question: "Can I update my portfolio after the card is delivered?",
    answer: "Yes. The hosted profile is editable, so your card can keep pointing to the latest version of your profile.",
  },
  {
    question: "Can documents stay private?",
    answer: "Yes. Public media and private vault documents are separated so private files can be shared only with signed URLs.",
  },
  {
    question: "Can companies manage multiple users?",
    answer: "Yes. The roadmap includes admin moderation tools for account edits, pauses, and hosted-site control.",
  },
] as const;
