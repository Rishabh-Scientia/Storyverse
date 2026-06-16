require("dotenv").config();
const { PrismaLibSql } = require("@prisma/adapter-libsql");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url: databaseUrl });
const db = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await db.comment.deleteMany({});
  await db.review.deleteMany({});
  await db.rating.deleteMany({});
  await db.bookmark.deleteMany({});
  await db.readingList.deleteMany({});
  await db.follow.deleteMany({});
  await db.chapter.deleteMany({});
  await db.story.deleteMany({});
  await db.user.deleteMany({});

  // Create Users
  const admin = await db.user.create({
    data: {
      username: "admin",
      email: "admin@storyverse.com",
      passwordHash: hashPassword("admin123"),
      role: "ADMIN",
      bio: "Lead moderator and administrator of StoryVerse.",
      isVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    },
  });

  const jane = await db.user.create({
    data: {
      username: "jane_doe",
      email: "jane@storyverse.com",
      passwordHash: hashPassword("jane123"),
      role: "WRITER",
      bio: "Bestselling fantasy novelist, world-builder, and coffee addict. Author of the Aethelgard chronicles.",
      isVerified: true,
      streakDays: 15,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      socialLinks: JSON.stringify({ twitter: "@janedoe", website: "https://janedoe.com" }),
    },
  });

  const alex = await db.user.create({
    data: {
      username: "alex_scribe",
      email: "alex@storyverse.com",
      passwordHash: hashPassword("alex123"),
      role: "WRITER",
      bio: "Exploring the dark corners of sci-fi, poetry, and cyberpunk. Lover of retro tech.",
      isVerified: false,
      streakDays: 4,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      socialLinks: JSON.stringify({ twitter: "@alexscribe" }),
    },
  });

  const reader = await db.user.create({
    data: {
      username: "bookworm99",
      email: "reader@storyverse.com",
      passwordHash: hashPassword("reader123"),
      role: "USER",
      bio: "Avid reader, critical reviewer, and curator of premium fantasy reading lists.",
      streakDays: 8,
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
  });

  console.log("Users created:", { admin: admin.username, jane: jane.username, alex: alex.username, reader: reader.username });

  // Create Follows
  await db.follow.create({
    data: {
      followerId: reader.id,
      followingId: jane.id,
    },
  });
  await db.follow.create({
    data: {
      followerId: reader.id,
      followingId: alex.id,
    },
  });
  await db.follow.create({
    data: {
      followerId: jane.id,
      followingId: alex.id,
    },
  });

  // Create Stories
  const story1 = await db.story.create({
    data: {
      title: "The Echoes of Aethelgard",
      subtitle: "Book I of the Chrono-Shattered Realm",
      description: "In a world where time itself is fractured into floating islands, a young cartographer discovers a clockwork key that can mend the past, or destroy the present. Pursued by the Chrono-Inquisition, she must fly across the temporal abyss to locate the legendary Echoes.",
      genre: "Fantasy",
      category: "Novel",
      tags: "magic, steampunk, adventure, time-travel",
      language: "English",
      ageRating: "Teen",
      storyType: "Novel",
      status: "PUBLIC",
      monetization: "FREE",
      reads: 1420,
      likes: 382,
      authorId: jane.id,
      coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
      aiSummary: "A temporal fantasy where a young cartographer named Lyra finds a clockwork artifact that controls time. Pursued by an inquisition, she must navigate floating timeline islands to prevent global chronological collapse.",
      aiKeywords: "chrono-shattered, temporal abyss, cartographer, clockwork key",
      aiContentRating: "Teen (Minor violence, thematic elements)",
      aiCoverReview: "Excellent visual balance. The blue-gold color scheme creates a magical, high-contrast, premium aesthetic that appeals directly to YA fantasy fans."
    },
  });

  const story2 = await db.story.create({
    data: {
      title: "Neon Whispers",
      subtitle: "A Cyberpunk Noir Mystery",
      description: "When a digital ghost starts assassinating high-ranking megacorp executives through their cybernetic neural links, a washed-up private eye with an old-school biological brain is hired to solve the murders. But some secrets are better left unplugged.",
      genre: "Sci-Fi",
      category: "Short Story",
      tags: "cyberpunk, detective, noir, AI",
      language: "English",
      ageRating: "Mature",
      storyType: "Short Story",
      status: "PUBLIC",
      monetization: "PREMIUM",
      price: 2.99,
      reads: 605,
      likes: 194,
      authorId: alex.id,
      coverUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400",
      aiSummary: "Cyberpunk detective noir about a detective investigating synthetic murders using biological brain bypasses.",
      aiKeywords: "digital ghost, neural link, cybernetic, megacorp",
      aiContentRating: "Mature (Violence, strong language)",
      aiCoverReview: "Atmospheric, but could use higher lighting contrast on the neon elements to emphasize the cyberpunk noir theme."
    },
  });

  const story3 = await db.story.create({
    data: {
      title: "Silent Symphony",
      subtitle: "A Collection of Modern Verses",
      description: "An anthology of short poems exploring the silence between words, the stillness of midnight cities, and the heavy weight of unexpressed love. A soft, introspective journey for quiet souls.",
      genre: "Poetry",
      category: "Poetry",
      tags: "lyrical, melancholic, love, short",
      language: "English",
      ageRating: "Everyone",
      storyType: "Poetry",
      status: "PUBLIC",
      monetization: "FREE",
      reads: 240,
      likes: 88,
      authorId: alex.id,
      coverUrl: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400",
      aiSummary: "Anthology of modern short poetry dealing with urban isolation, quiet love, and existential longing.",
      aiKeywords: "anthology, silence, modern poetry, lyrical",
      aiContentRating: "Everyone",
      aiCoverReview: "Simple and elegant. The minimalistic aesthetic aligns perfectly with the quiet, introspective theme of the book."
    },
  });

  console.log("Stories created:", { story1: story1.title, story2: story2.title, story3: story3.title });

  // Add Chapters for Story 1
  await db.chapter.create({
    data: {
      storyId: story1.id,
      chapterNo: 1,
      title: "The Clockwork Key",
      content: `The sky over Aethelgard did not blue; it ticked.

Lyra adjusted her brass-rimmed goggles, her fingertips smudged with soot and oil. Below her, the temporal gearworks of the Lower Quarter hummed—a rhythmic, grinding bassline that vibrated through the floorboards of her workshop. Today was the Day of the Great Aligning, when the three floating islands of the Hourglass archipelago would drift close enough for the bridge-ships to cast their magnetic anchors.

But Lyra wasn't watching the sky. Her eyes were locked on a small, spherical object resting in the palm of her gloved hand.

It was no larger than a pocket watch, yet it weighed as much as an anvil. Its casing was made of dark, star-fired iron, etched with runes that seemed to shift positions when she blinked. Unlike every other clockwork device in Aethelgard, this one had no visible winding stem. Yet, inside, she could hear the rapid, chaotic scuttle of gears.

It didn't sound like time ticking. It sounded like time trying to escape.

"Lyra!"

The workshop door banged open. Jax stood in the doorway, breathing heavily, his leather coat singed at the collar. "You need to pack. Now. The Inquisition's steam-clippers just cleared the harbor. They aren't doing routine inspections. They're searching for *it*."

Lyra closed her fist over the sphere. The metal felt ice-cold against her leather glove. "How did they find out?"

"Someone talked in the tavern," Jax said, pulling a satchel from the wall hooks and tossing it to her. "Or maybe the sphere itself is screaming across the temporal wavelengths. It doesn't matter. We have ten minutes before they lock down the docks."

She looked at her worktable, covered in hand-drawn maps of the floating timelines, and then back to the ticking sphere. If the Chrono-Inquisition got their hands on this, the fractured timelines would never be mended. They would lock the world into a single, permanent loop—one where they held absolute power, and the rest of the islands starved in the dark.

"I'm ready," Lyra said, slinging the satchel over her shoulder. She slipped the clockwork key into her inner coat pocket.

As they dashed out into the smog-choked streets, the sky gave a long, metallic groan. The gears were shifting. The past was catching up.`
    }
  });

  await db.chapter.create({
    data: {
      storyId: story1.id,
      chapterNo: 2,
      title: "The Temporal Abyss",
      content: `The wind between the floating islands was always freezing, carrying the scent of ozone and forgotten yesterday.

Lyra and Jax sprinted along the narrow catwalk of Sector 4. Behind them, the hiss of steam-pistols echoed off the iron-plated walls. Three inquisitors, clad in their signature crimson-lined coats and copper faceplates, pursued them with mechanical precision.

"Halt, in the name of the Prime Chronologist!" the lead inquisitor bellowed, his voice distorted by his respirator.

"Keep running!" Jax shouted, pushing Lyra forward. "The bridge-ship *The Zenith* is anchored at Catwalk 9. If we can make it before they release the magnetic clamp, we can jump to the 1880 island!"

"That timeline is unstable!" Lyra yelled back, her boots clattering against the metal grating. "It's in a perpetual lightning storm!"

"Unstable is better than dead!"

A blue bolt of compressed steam cracked past Lyra's ear, shattering a pipe to her left. Scolding steam hissed into the air, blinding their pursuers for a crucial second. Lyra reached the edge of the catwalk. Below them lay the Endless Void—a vast, swirling fog where mismatched pieces of history floated. If they fell, they would drift forever, trapped between seconds.

Connecting Sector 4 to the next floating island was a massive, swaying magnetic anchor cable. *The Zenith*, a twin-hulled airship propelled by steam-turbines, was pulling away, its iron mooring clamps slowly disengaging.

"We have to jump!" Jax said.

He grabbed the zipline harness hanging from the catwalk railing, clicked it onto the main cable, and leaped into the abyss, sliding down toward the airship's deck.

Lyra looked back. The inquisitors were bursting through the steam cloud, their copper faceplates glowing. She reached into her pocket, felt the comforting weight of the clockwork key, and grabbed the second zipline.

With a deep breath, she stepped off the platform.

The wind screamed in her ears. The void yawned below. She slid down the magnetic cable at terrifying speed. Behind her, an inquisitor aimed a heavy rifle. A shot fired. The cable groaned, sparks flying. The zipline jerked violently, throwing Lyra off balance.

She lost her grip.

She fell, tumbling into the cold temporal fog.`
    }
  });

  await db.chapter.create({
    data: {
      storyId: story1.id,
      chapterNo: 3,
      title: "The Fragmented Past",
      content: `Lyra woke to the smell of damp pine and wet earth.

She opened her eyes, expecting to see the grey fog of the void or the iron walls of an Inquisition cell. Instead, she saw a canopy of massive, ancient trees. The air was warm, heavy with moisture. The ticking of Aethelgard was completely gone, replaced by the chirping of insects and the distant roar of a waterfall.

She sat up, groaning. Her body was bruised, but nothing seemed broken.

She immediately reached for her inner pocket. The clockwork key was still there. It felt warm now, pulsing with a slow, steady heartbeat.

"Jax?" she called out, looking around the forest. There was no sign of him, or the airship, or the catwalks.

She stood up and brushed the dirt from her trousers. Her compass was spinning wildly, the needle unable to find north. Her pocket watch had stopped entirely.

She stepped through the dense foliage, following the sound of the waterfall. After a few minutes, she emerged onto a cliffside.

Her breath caught.

Before her lay a massive valley. But it was not normal. The valley was split into clean, vertical slices. In one slice, the trees were green and lush. In the slice next to it, the ground was covered in thick snow and ice. In another, the ground was charred black, with rivers of lava flowing. It was a jigsaw puzzle of different seasons and eras, sitting side by side.

She pulled out the clockwork key. As she held it up, the etchings on its surface began to spin. A beam of golden light projected from the center, pointing directly at a massive stone temple floating in the center of the seasonal chaos.

"The Temporal Core," she whispered.

She wasn't just in another island. She had fallen into the Shattered Age.

She took her first step down the mountain. She had to find Jax, and she had to reach that temple before the Inquisition figured out where she had landed.`
    }
  });

  // Add Chapters for Story 2
  await db.chapter.create({
    data: {
      storyId: story2.id,
      chapterNo: 1,
      title: "The Ghost in the Core",
      content: `The rain in Neo-Chicago was acidic enough to melt the cheap chrome off a street-runner’s arm.

Silas sat in his third-story office, his feet propped up on a desk made of salvaged carbon fiber. He was clean-shaven, wore a faded canvas trench coat, and was currently drinking real coffee—a luxury that cost him half his weekly earnings.

His cybernetic eye was switched off. Silas preferred his biological one; it didn't overlay target telemetry or pop up advertisement notifications.

The door didn't knock. It slid open, retracting into the wall with a hydraulic hiss.

A woman walked in. She was wearing an expensive silk suit that shimmered with active camouflage, rendering her semi-transparent in the dimly lit office. She deactivated the cloak, revealing a face that was symmetry-perfect—the work of a high-end biotech clinic.

"Silas Vance?" she asked. Her voice was clean, un-modulated.

"Depends on who’s asking," Silas said, not moving his feet.

"My name is Elena Mercer. I am the VP of Operations at Aegis Corp."

Silas let out a dry chuckle. "Aegis Corp. The people who make the neural links for the top five percent. You're in the wrong neighborhood, Ms. Mercer. The closest Aegis clinic is four sectors east, behind armed guard walls."

Elena didn't smile. She placed a small, silver data-shard on the desk. "Three hours ago, our CEO, Robert Sterling, died of a cerebral hemorrhage. His neural link overloaded, frying his prefrontal cortex."

"Sounds like a bad batch of hardware," Silas said, taking a sip of coffee. "Call the warranty department."

"It wasn't hardware," Elena said, leaning in. "We ran a diagnostic. A file was uploaded directly to his link. A string of code that forced a massive electrical surge. It bypasses our firewalls. It bypassed his personal security AI."

She tapped the data-shard. A holographic projection filled the room. It showed Sterling's brain activity, a sudden spike of red, and then... a pattern. The electricity had fired in rhythmic bursts, tracing a shape before the brain died.

It was a smiley face.

"A digital ghost," Silas murmured, his interest piqued. "Who wrote it?"

"We don't know," Elena said. "But Robert is the third executive to die this way this month. The public doesn't know yet, but if they find out that our 'unhackable' links can be turned into remote-execution devices, Aegis will collapse. I need you to find this ghost."

"Why me? Your security teams have military-grade netrunners."

"Our netrunners are connected," Elena said. "They live in the grid. If they search for this ghost, the ghost will see them coming through the neural pathways. You, Mr. Vance, have a biological brain. You aren't connected to the global net. You're invisible to it."

Silas rubbed his temple. His biological brain was old-school, slow, and prone to headaches.

But it was safe. Or so he hoped.

"My fee is fifty thousand credits," Silas said. "Half up front."

"Done," Elena said, bypassing his bio-signature with a hand gesture that deposited the funds into his terminal account. "Find them, Silas. Before they find me."`
    }
  });

  // Add Chapters for Story 3
  await db.chapter.create({
    data: {
      storyId: story3.id,
      chapterNo: 1,
      title: "Prelude to Silence",
      content: `I.
The city is a crowded room
where everyone is shouting,
yet nobody hears the drop
of a single tear in the train station.
We press our faces to cold glass,
speeding through tunnels of concrete,
looking for an echo of something real.

II.
You were the book I read in a rush,
skipping pages to find the end,
only to realize too late
that the beauty was in the sentences
I was too impatient to memorize.
Now I sit in the quiet library of my mind,
tracing the blank margins where you used to be.

III.
There is a silence that heals
and a silence that breaks.
Ours was the latter—
a brick wall built of unsaid words,
brick by brick, night after night,
until we could no longer see
the sky we shared.`
    }
  });

  // Create Ratings & Reviews
  await db.rating.create({
    data: {
      storyId: story1.id,
      userId: reader.id,
      value: 5,
    },
  });

  await db.rating.create({
    data: {
      storyId: story1.id,
      userId: alex.id,
      value: 4,
    },
  });

  await db.review.create({
    data: {
      storyId: story1.id,
      userId: reader.id,
      title: "An Absolute Steampunk Masterpiece!",
      content: "I could not put this book down! The world-building of Aethelgard is extremely detailed, and the transition between different timeline shards feels so fresh. Lyra is an amazing protagonist.",
      rating: 5,
    },
  });

  await db.review.create({
    data: {
      storyId: story1.id,
      userId: alex.id,
      title: "Very atmospheric, but pace is fast",
      content: "Jane has done it again. The clockwork aesthetics are top-tier. My only critique is that Chapter 2 moves a bit too fast through the action, but Chapter 3's environment makes up for it. Recommended!",
      rating: 4,
    },
  });

  // Create Comments
  await db.comment.create({
    data: {
      storyId: story1.id,
      userId: reader.id,
      content: "That first chapter set the mood perfectly! The description of the sky ticking is brilliant.",
    },
  });

  await db.comment.create({
    data: {
      storyId: story1.id,
      userId: alex.id,
      content: "Watch out for the Inquisition, Lyra! Great starting chapter.",
    },
  });

  // Create Reading Lists
  await db.readingList.create({
    data: {
      name: "Currently Reading",
      userId: reader.id,
    },
  });

  await db.readingList.create({
    data: {
      name: "Want to Read",
      userId: reader.id,
    },
  });

  await db.readingList.create({
    data: {
      name: "Finished Reading",
      userId: reader.id,
    },
  });

  // Create bookmarks
  await db.bookmark.create({
    data: {
      storyId: story1.id,
      userId: reader.id,
      chapterNo: 2,
      progress: 45,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
