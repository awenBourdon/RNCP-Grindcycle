import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValidDomains() {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "aol.com",
    "icloud.com",
    "protonmail.com",
    "zoho.com",
    "mail.com",
    "gmx.com",
    "gmx.net",
    "gmx.fr",
    "orange.fr",
    "sfr.fr",
    "free.fr",
    "neuf.fr",
    "wanadoo.fr",
    "laposte.net",
    "bbox.fr",
    "numericable.fr",
    "bouygues.fr",
    "comcast.net",
    "verizon.net",
    "att.net",
    "t-online.de",
    "web.de",
    "telenet.be",
    "skynet.be",
    "proximus.be",
    "btinternet.com",
    "sky.com",
    "virginmedia.com",
    "tutanota.com",
    "fastmail.com",
    "pm.me",
    "proton.me",
    "mailfence.com",
    "yandex.com",
    "yandex.ru",
    "disroot.org",
    "posteo.de",
    "mailbox.org",
    "startmail.com",
    "mac.com",
    "me.com",
    "msn.com",
    "rocketmail.com",
    "ymail.com",
    "googlemail.com",
    "cock.li",
    "opayq.com",
    "hushmail.com",
    "lycos.com",
    "rediffmail.com",
    "hey.com"
  ];

  if (process.env.NODE_ENV === "development") {
    domains.push("test.com")
  }

  return domains;
};

export function normalizeName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z\s'-]/g, "")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
