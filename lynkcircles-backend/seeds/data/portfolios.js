// Portfolio entries per worker. Each entry references the worker's
// WorkDetail (matched on serviceKey at seed time) and may include
// past-client reviews (the seed reviewer is a Client persona).

const img = (seed) => `https://picsum.photos/seed/${seed}/800/600`;

export const PORTFOLIOS = [
  {
    workerUsername: "ramesh_carpenter",
    items: [
      {
        jobTitle: "Modular kitchen — 8 ft L-shape with island",
        description:
          "Plywood carcasses, soft-close hinges throughout. Took 18 days from measurement to handover. Owner wanted matte laminate — sourced from Greenply.",
        images: [img("ramesh-1a"), img("ramesh-1b"), img("ramesh-1c")],
        completedDaysAgo: 45,
        client: { username: "anil_homes", name: "Anil Kothari" },
        reviews: [
          {
            reviewerUsername: "anil_homes",
            review:
              "Honest pricing, came on schedule each day. Cleaned up after himself which I really appreciated. Will hire again for the wardrobe project.",
            rating: 5,
            images: [img("ramesh-r1")],
          },
        ],
      },
      {
        jobTitle: "Wall-mounted study desk + cabinet",
        description:
          "Compact home-office setup, 4.5 ft wide. Cable cutouts cut to spec, hidden power strip channel underneath.",
        images: [img("ramesh-2a"), img("ramesh-2b")],
        completedDaysAgo: 110,
        client: { username: "sneha_b", name: "Sneha Banerjee" },
        reviews: [
          {
            reviewerUsername: "sneha_b",
            review:
              "Used Ramesh for two of our studio projects now. Reliable and his joinery is genuinely a step above the others we've tried.",
            rating: 5,
          },
        ],
      },
    ],
  },
  {
    workerUsername: "anita_embroidery",
    items: [
      {
        jobTitle: "Bridal blouse panel — full zardozi",
        description:
          "Hand + machine combination on a silk base. 9 days. Customer's design, my finish.",
        images: [img("anita-1a"), img("anita-1b"), img("anita-1c"), img("anita-1d")],
        completedDaysAgo: 28,
        client: { username: "aarti_d", name: "Aarti Desai" },
        reviews: [
          {
            reviewerUsername: "aarti_d",
            review:
              "The finish on the dori work is exceptional. I've added her as a permanent freelancer for my boutique.",
            rating: 5,
            images: [img("anita-r1"), img("anita-r2")],
          },
        ],
      },
      {
        jobTitle: "Contract — 40 lehenga dupattas",
        description:
          "Bulk order for export. Same motif across all 40 pieces, computerised. Met deadline 3 days early.",
        images: [img("anita-2a"), img("anita-2b")],
        completedDaysAgo: 70,
        client: { username: "ritesh_m", name: "Ritesh Modi" },
        reviews: [
          {
            reviewerUsername: "ritesh_m",
            review:
              "Quality consistent across all 40 pieces. Re-hired for the next batch.",
            rating: 5,
          },
        ],
      },
    ],
  },
  {
    workerUsername: "vikram_plumb",
    items: [
      {
        jobTitle: "Geyser + RO installation — new flat",
        description:
          "Geyser mounted, RO with under-sink storage, new tap fittings. Pressure-tested everything before leaving.",
        images: [img("vikram-1a"), img("vikram-1b")],
        completedDaysAgo: 12,
        client: { username: "prakash_g", name: "Prakash Gupta" },
        reviews: [
          {
            reviewerUsername: "prakash_g",
            review:
              "Showed up at 8am, done by noon. Fair price, no upselling. Saved his number.",
            rating: 5,
          },
        ],
      },
    ],
  },
  {
    workerUsername: "priya_clean",
    items: [
      {
        jobTitle: "Move-out deep clean — 3 BHK",
        description:
          "Owner needed it spotless for handover. 6 hours, 2 people. Including kitchen chimney, oven, balconies.",
        images: [img("priya-1a"), img("priya-1b")],
        completedDaysAgo: 22,
        client: { username: "anil_homes", name: "Anil Kothari" },
        reviews: [
          {
            reviewerUsername: "anil_homes",
            review:
              "Genuinely thorough. The landlord couldn't find anything to deduct from the deposit.",
            rating: 5,
          },
        ],
      },
    ],
  },
  {
    workerUsername: "deepika_salon",
    items: [
      {
        jobTitle: "Bridal makeup + hair — wedding morning",
        description:
          "HD makeup with airbrush base. Bride wanted soft natural look with bold lip. 4 hours total including hair.",
        images: [img("deepika-1a"), img("deepika-1b"), img("deepika-1c")],
        completedDaysAgo: 35,
        client: { username: "divya_p", name: "Divya Pillai" },
        reviews: [
          {
            reviewerUsername: "divya_p",
            review:
              "I'm not a makeup person at all and she made me feel like myself but better. Photos came out incredible.",
            rating: 5,
            images: [img("deepika-r1")],
          },
        ],
      },
    ],
  },
  {
    workerUsername: "arjun_ac",
    items: [
      {
        jobTitle: "AC servicing — 4 splits + 1 window",
        description:
          "Annual maintenance for a small office. Coil clean, gas check, filter wash on all 5. Same day.",
        images: [img("arjun-1a")],
        completedDaysAgo: 8,
        client: { username: "kiran_s", name: "Kiran Sethi" },
        reviews: [
          {
            reviewerUsername: "kiran_s",
            review:
              "Quick, no nonsense, no upsell. Cooling improved noticeably across all units.",
            rating: 5,
          },
        ],
      },
    ],
  },
  {
    workerUsername: "kavita_yoga",
    items: [
      {
        jobTitle: "Prenatal yoga — 12-week program",
        description:
          "Twice a week home sessions through the second trimester. Customised to client's mobility each week.",
        images: [img("kavita-1a")],
        completedDaysAgo: 60,
        client: { username: "divya_p", name: "Divya Pillai" },
        reviews: [
          {
            reviewerUsername: "divya_p",
            review:
              "She made the whole pregnancy easier. Genuinely knowledgeable about what's safe and what isn't.",
            rating: 5,
          },
        ],
      },
    ],
  },
  {
    workerUsername: "karthik_dev",
    items: [
      {
        jobTitle: "Inventory app — small textile manufacturer",
        description:
          "MVP in 5 weeks. React Native + Node + Postgres. Barcode scanner, SKU management, weekly summary email. Deployed on Render.",
        images: [img("karthik-1a"), img("karthik-1b")],
        completedDaysAgo: 90,
        client: { username: "ritesh_m", name: "Ritesh Modi" },
        reviews: [
          {
            reviewerUsername: "ritesh_m",
            review:
              "Scoped honestly, delivered on time, didn't disappear after launch. Hard combination to find.",
            rating: 5,
          },
        ],
      },
    ],
  },
  {
    workerUsername: "neha_photo",
    items: [
      {
        jobTitle: "Wedding — 2-day shoot",
        description:
          "Sangeet evening + main wedding next day. ~1100 edited photos delivered in 11 days. Highlight reel included.",
        images: [img("neha-1a"), img("neha-1b"), img("neha-1c"), img("neha-1d")],
        completedDaysAgo: 50,
        client: { username: "rohan_m", name: "Rohan Malhotra" },
        reviews: [
          {
            reviewerUsername: "rohan_m",
            review:
              "Calm energy on a chaotic day. The candids are the best we've seen across 15+ weddings we've planned.",
            rating: 5,
            images: [img("neha-r1"), img("neha-r2")],
          },
        ],
      },
    ],
  },
  {
    workerUsername: "lakshmi_cook",
    items: [
      {
        jobTitle: "Daily tiffin — South Indian, diabetic-friendly",
        description:
          "6 months running. Two meals a day, both fresh. Menu rotates weekly.",
        images: [img("lakshmi-1a")],
        completedDaysAgo: 15,
        client: { username: "suresh_iy", name: "Suresh Iyengar" },
        reviews: [
          {
            reviewerUsername: "suresh_iy",
            review:
              "Best food I've eaten since my wife passed. She really listens to what we can and can't have.",
            rating: 5,
          },
        ],
      },
    ],
  },
];
