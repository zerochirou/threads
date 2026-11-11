import type { ThreadPostItem } from "../types";

export const DEFAULT_POSTS: ThreadPostItem[] = [
  {
    id: "default-post-1",
    author: {
      username: "Keanu Kizoku Aotama",
      avatarUrl:
        "https://api.dicebear.com/10.x/notionists-neutral/svg?backgroundColor=ff2e88,00e5ff,ffe600,7cff00,ff6a00,b400ff&inkColor=101216&paperColor=ffffff&seed=Keanu",
      fallback: "LY",
      verified: true,
      hasFollowBadge: true,
    },
    timeAgo: "1h",
    content: `
Assalamual’aikum Wr. Wb.

Hallo Everyone!!

Perkenalkan saya Keanu Kizoku Aotama dari Autobot, siap berpartisipasi dan menjadi bagian dari kegiatan LOKAKARYA 2! 🤖

Melalui kegiatan ini, mari bersama-sama mengaktualisasikan potensi, menguatkan sinergi, serta melahirkan ide dan inovasi yang mampu membawa perubahan nyata. Karena masa depan tidak hanya tentang apa yang kita nantikan, tetapi juga tentang apa yang berani kita wujudkan hari ini! 🤍

"Harapan adalah akar dari semua rasa sakit di hati" ~Adios

@mantsanidigitalcreative
#ActivateThePowerTransformTheFuture
#Lokakarya2mdc2026
#MANTSANIDIGITALCREATIVE

⚡️See you at LOKAKARYA 2 !!

Wassalamual’aikum Wr. Wb.`,
    imageUrl: "/assets/specials/twibbon.jpeg",
    likeCount: 142,
    commentCount: 19,
    repostCount: 8,
    shareCount: 14,
    viewsCount: "12K views",
    isLiked: false,
    isSaved: false,
  },
  {
    id: "default-post-2",
    author: {
      username: "Lynn",
      avatarUrl: "https://api.dicebear.com/10.x/notionists/svg?seed=Ti",
      fallback: "LY",
      verified: true,
      hasFollowBadge: true,
    },
    timeAgo: "1h",
    content: `Art by-Lynn`,
    imageUrl: "/assets/specials/specials-post.jpeg",
    likeCount: 142,
    commentCount: 19,
    repostCount: 8,
    shareCount: 14,
    viewsCount: "12K views",
    isLiked: false,
    isSaved: false,
  },
];
