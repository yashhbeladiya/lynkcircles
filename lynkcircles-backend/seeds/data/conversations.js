// Sample message threads. Each thread is between one client and one
// worker. Messages are seeded in order with synthetic timestamps
// (oldest first) so the chat pane reads naturally.

const minsAgo = (n) => new Date(Date.now() - n * 60 * 1000);

export const CONVERSATIONS = [
  {
    a: "anil_homes",
    b: "ramesh_carpenter",
    messages: [
      { from: "a", text: "Hi Ramesh, saw your profile — interested in the kitchen drawer fix I posted. Available Saturday?", minsAgo: 2880 },
      { from: "b", text: "Hello sir, yes Saturday is fine. Can you share a photo of the slides?", minsAgo: 2870 },
      { from: "a", text: "Sending you a couple now.", minsAgo: 2860 },
      { from: "a", text: "Top two drawers and bottom right.", minsAgo: 2858 },
      { from: "b", text: "Looks like the rails need full replacement, not repair. I will bring a set of soft-close 18-inch. Cost around ₹1800 for material.", minsAgo: 2810 },
      { from: "a", text: "That works. Labour quote?", minsAgo: 2800 },
      { from: "b", text: "₹1500 for the three. Total ₹3300.", minsAgo: 2790 },
      { from: "a", text: "Done. See you 10am Saturday.", minsAgo: 2780 },
      { from: "b", text: "Confirmed. I will message when I leave for your place.", minsAgo: 2778 },
    ],
  },
  {
    a: "divya_p",
    b: "lakshmi_cook",
    messages: [
      { from: "a", text: "Lakshmi auntie — Suresh uncle recommended you. Are you taking new clients in Bengaluru?", minsAgo: 1440 },
      { from: "b", text: "Hello dear. I am only in Chennai. But I can suggest someone in Bengaluru if you want.", minsAgo: 1430 },
      { from: "a", text: "Oh no, I assumed because of the platform. Yes please, would appreciate the recommendation 🙏", minsAgo: 1425 },
      { from: "b", text: "I will send you a name and number by evening. She is from my hometown.", minsAgo: 1420 },
      { from: "a", text: "Thank you so much.", minsAgo: 1418 },
    ],
  },
  {
    a: "sneha_b",
    b: "ramesh_carpenter",
    messages: [
      { from: "a", text: "Ramesh, the Aundh project — when can you start the wardrobe carcasses?", minsAgo: 240 },
      { from: "b", text: "Wednesday I am free. I need plywood delivery confirmed first.", minsAgo: 230 },
      { from: "a", text: "Plywood is at site already. 18mm BWP, 6 sheets. Hardware will reach Tuesday.", minsAgo: 220 },
      { from: "b", text: "Good. I will be there 9am Wednesday. Anything else for the bedroom or just wardrobe?", minsAgo: 215 },
      { from: "a", text: "Just wardrobe for now. Bed and side tables next phase.", minsAgo: 210 },
      { from: "b", text: "Okay sister. See you Wednesday.", minsAgo: 200 },
    ],
  },
  {
    a: "ritesh_m",
    b: "anita_embroidery",
    messages: [
      { from: "a", text: "Anita — next batch is 60 dupattas, same motif as last time. Can you take it?", minsAgo: 720 },
      { from: "b", text: "Sir yes. By when do you need delivery?", minsAgo: 710 },
      { from: "a", text: "20 days.", minsAgo: 708 },
      { from: "b", text: "Possible. Rate same as last batch?", minsAgo: 705 },
      { from: "a", text: "Yes. I will send raw material to your place tomorrow.", minsAgo: 700 },
      { from: "b", text: "Thank you sir. Will start day after.", minsAgo: 695 },
    ],
  },
  {
    a: "kiran_s",
    b: "arjun_ac",
    messages: [
      { from: "a", text: "Arjun, my Bluestar split is not cooling. Indoor fan working but air is room-temp.", minsAgo: 90 },
      { from: "b", text: "Most likely gas leak. Visit charge ₹800, gas charge if needed ₹2200. I can come tomorrow morning.", minsAgo: 85 },
      { from: "a", text: "Tomorrow 10am okay?", minsAgo: 84 },
      { from: "b", text: "Confirmed. I will message before leaving.", minsAgo: 82 },
      { from: "a", text: "Thanks 👍", minsAgo: 80 },
    ],
  },
  {
    a: "anil_homes",
    b: "tariq_barber",
    messages: [
      { from: "a", text: "Hey Tariq, Saturday morning haircut at home for me and my son?", minsAgo: 60 },
      { from: "b", text: "Sure sir. 10:30 okay? Fade for you, school cut for the kid?", minsAgo: 55 },
      { from: "a", text: "Perfect. Building tower B, Bandra West. Will share gate pin.", minsAgo: 50 },
      { from: "b", text: "Got it. See you Saturday.", minsAgo: 45 },
    ],
  },
];
