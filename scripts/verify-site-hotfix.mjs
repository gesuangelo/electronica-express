import { readFileSync } from "node:fs";

const pages = [
  {
    file: "index.html",
    canonical: "https://electronicaexpress.cl/",
    h1: "Tu tecnología siempre lista para enseñar.",
  },
  {
    file: "servicios/index.html",
    canonical: "https://electronicaexpress.cl/servicios/",
    h1: "Soluciones en soporte TI",
  },
  {
    file: "marcas/index.html",
    canonical: "https://electronicaexpress.cl/marcas/",
    h1: "Marcas que atendemos",
  },
  {
    file: "galeria/index.html",
    canonical: "https://electronicaexpress.cl/galeria/",
    h1: "Ingeniería en Acción",
  },
];

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL ${message}`);
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

for (const page of pages) {
  const html = readFileSync(page.file, "utf8");
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) =>
    stripTags(match[1]),
  );

  if (/aos@next|data-aos|AOS\.init/.test(html)) {
    fail(`${page.file} must not depend on AOS for visible content`);
  }

  if (html.includes("High-End Tech Support")) {
    fail(`${page.file} must not use the old High-End Tech Support tagline`);
  }

  if (html.includes("WhatsApp Directo")) {
    fail(`${page.file} must use the softer support CTA copy`);
  }

  if (html.includes("brand-mark") || html.includes("logonavegador.png")) {
    fail(`${page.file} must not show the old header logo icon`);
  }

  if (page.file === "index.html") {
    for (const removedHomeText of ["Colegios y aulas digitales", "Cobertura nacional"]) {
      if (html.includes(removedHomeText)) {
        fail(`${page.file} must not show removed hero chip text: ${removedHomeText}`);
      }
    }

    if (html.includes("nexo-badge") || html.includes("nexo-word")) {
      fail(`${page.file} must not show the removed NEXO hero badge`);
    }

    if (html.includes('class="flex items-center justify-between border-b border-[#ece5da] px-5 py-4')) {
      fail(`${page.file} must not show the removed hero image header text`);
    }
  }

  for (const requiredText of ["Grupo NEXO", "Producto técnico de Grupo NEXO", "Hablar con soporte"]) {
    if (!html.includes(requiredText)) {
      fail(`${page.file} missing required NEXO bridge text: ${requiredText}`);
    }
  }

  if (!html.includes("https://nexoeducacion.cl/")) {
    fail(`${page.file} must link back to nexoeducacion.cl`);
  }

  if (h1s.length !== 1 || h1s[0] !== page.h1) {
    fail(`${page.file} expected one page h1 "${page.h1}", got [${h1s.join(" | ")}]`);
  }

  if (!html.includes(`<link rel="canonical" href="${page.canonical}">`)) {
    fail(`${page.file} missing canonical ${page.canonical}`);
  }

  if (!/<meta name="description" content="[^"]{40,}"/.test(html)) {
    fail(`${page.file} missing useful meta description`);
  }

  for (const property of ["og:title", "og:description", "og:url", "og:site_name"]) {
    if (!html.includes(`property="${property}"`)) {
      fail(`${page.file} missing ${property}`);
    }
  }

  for (const name of ["toggleMobileMenu", "toggleModal"]) {
    for (const match of html.matchAll(new RegExp(`<button[^>]*${name}[^>]*>`, "gi"))) {
      if (!/\baria-label=/.test(match[0])) {
        fail(`${page.file} ${name} button is icon-only without aria-label`);
      }
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*href="https:\/\/wa\.me\/56945472139"[^>]*class="[^"]*\bfixed\b[^"]*"[^>]*>/gi)) {
    if (!/\baria-label=/.test(match[0])) {
      fail(`${page.file} floating WhatsApp link is icon-only without aria-label`);
    }
  }

  if (page.file === "servicios/index.html") {
    const requiredServiceImages = [
      "assets/generated/servicio-pantallas-interactivas.png",
      "assets/generated/servicio-ops.png",
      "assets/generated/servicio-notebooks.png",
      "assets/generated/servicio-preventivo.png",
      "assets/generated/servicio-asesoria-compra.png",
      "assets/generated/servicio-soporte-remoto.png",
    ];

    for (const image of requiredServiceImages) {
      if (!html.includes(image)) {
        fail(`${page.file} missing generated service image: ${image}`);
      }
    }

    if (/fa-(desktop|microchip|laptop-medical|shield-alt|briefcase|network-wired)/.test(html)) {
      fail(`${page.file} service cards must use generated images instead of the old icons`);
    }
  }

  if (page.file === "galeria/index.html") {
    if (!html.includes("assets/generated/galeria-carros-carga-sin-logo.png")) {
      fail(`${page.file} must use the generated charging-cart image without logo or 4K`);
    }

    if (html.includes("publicidad-carros.png")) {
      fail(`${page.file} must not use the old charging-cart gallery image`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} site hotfix checks failed.`);
  process.exit(1);
}

console.log("Site hotfix checks passed.");
