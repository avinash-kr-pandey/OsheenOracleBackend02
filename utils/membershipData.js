export const membershipPlans = [
  {
    id: "basic",
    name: "Rose Quartz",
    price: "$29",
    period: "month",
    features: [
      "Access to basic content library",
      "Monthly inspirational newsletter",
      "Community forum access",
      "10% discount on wellness events",
      "Basic email support",
      "Weekly mindfulness tips",
    ],
    popular: false,
  },
  {
    id: "premium",
    name: "Golden Bloom",
    price: "$79",
    period: "month",
    features: [
      "All Rose Quartz features",
      "Exclusive monthly webinars",
      "Priority 24/7 support",
      "25% discount on all events",
      "Early access to new content",
      "Member-only resource library",
      "Personalized coaching sessions",
      "VIP networking groups",
    ],
    popular: true,
  },
  {
    id: "vip",
    name: "Diamond Bliss",
    price: "$149",
    period: "month",
    features: [
      "All Golden Bloom features",
      "One-on-one personal coaching",
      "Exclusive VIP event invitations",
      "50% discount on premium events",
      "Dedicated success manager",
      "Customized wellness plan",
      "24/7 premium concierge",
      "Global networking opportunities",
      "Lifetime access to resources",
    ],
    popular: false,
  },
];

export default membershipPlans;
