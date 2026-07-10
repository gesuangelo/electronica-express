import { existsSync, readFileSync, statSync } from "node:fs";

const pages = [
  {
    file: "index.html",
    canonical: "https://electronicaexpress.cl/",
    h1: "Tu tecnología siempre lista para enseñar.",
    brandLogo: "assets/brand/electronica-express-logotipo.png",
  },
  {
    file: "servicios/index.html",
    canonical: "https://electronicaexpress.cl/servicios/",
    h1: "Soluciones en soporte TI",
    brandLogo: "../assets/brand/electronica-express-logotipo.png",
  },
  {
    file: "marcas/index.html",
    canonical: "https://electronicaexpress.cl/marcas/",
    h1: "Marcas que atendemos",
    brandLogo: "../assets/brand/electronica-express-logotipo.png",
  },
  {
    file: "galeria/index.html",
    canonical: "https://electronicaexpress.cl/galeria/",
    h1: "Ingeniería en Acción",
    brandLogo: "../assets/brand/electronica-express-logotipo.png",
  },
];

const brandAssets = [
  "assets/brand/electronica-express-logotipo.png",
  "assets/brand/electronica-express-logo.png",
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-48x48.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
];
const requiredMediaAssets = ["publicidad-marcas-hero.jpg"];
const sharedBrandCss = readFileSync("assets/site-header.css", "utf8");
const sharedTypographyCss = readFileSync("assets/site-typography.css", "utf8");

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

  if (!html.includes(`class="ee-brand-logo" src="${page.brandLogo}"`)) {
    fail(`${page.file} must show the new Electrónica Express logotype`);
  }

  if (html.includes('class="ee-brand-name"')) {
    fail(`${page.file} must not show the superseded text-only header brand`);
  }

  if (!html.includes(`class="footer-brand-logo" src="${page.brandLogo}"`)) {
    fail(`${page.file} footer must use the official Electrónica Express logotype`);
  }

  if (/>\s*ELECTRONICA EXPRESS\s*</i.test(html)) {
    fail(`${page.file} footer must not use the superseded text-only brand`);
  }

  if (!html.includes('footer class="site-footer-compact"')) {
    fail(`${page.file} footer must use the shared compact layout`);
  }

  if (!html.includes('class="site-footer-compact__inner"')) {
    fail(`${page.file} footer must use the shared compact inner grid`);
  }

  if (!html.includes('site-header.css?v=') || !html.includes('site-typography.css?v=')) {
    fail(`${page.file} must version shared CSS to avoid stale proportions`);
  }

  if (/<a\b[^>]*href="https:\/\/wa\.me\/56945472139"[^>]*class="[^"]*\bfixed\b/i.test(html)) {
    fail(`${page.file} must not show the floating WhatsApp button`);
  }

  if (page.file === "index.html") {
    if (!html.includes('class="home-hero-content"') || !html.includes('class="home-hero-media"')) {
      fail(`${page.file} hero content and media must use the shared proportional grid`);
    }

    for (const removedHeroMediaText of [
      "Soporte técnico para tecnología escolar",
      "Pantallas, OPS, notebooks, laboratorios y equipamiento educativo.",
    ]) {
      if (html.includes(removedHeroMediaText)) {
        fail(`${page.file} must not show removed hero media text: ${removedHeroMediaText}`);
      }
    }

    if (html.includes("animate-float") || html.includes("@keyframes float")) {
      fail(`${page.file} hero media must remain static`);
    }

    if (!html.includes('id="heroTypewriter"')) {
      fail(`${page.file} must expose the home hero typewriter target`);
    }

    for (const phrase of [
      "Tu tecnología siempre lista para enseñar.",
      "Aulas conectadas, clases sin interrupciones.",
      "Soporte técnico que mantiene tu colegio funcionando.",
    ]) {
      if (!html.includes(phrase)) {
        fail(`${page.file} missing approved typewriter phrase: ${phrase}`);
      }
    }

    if (!html.includes("window.matchMedia('(prefers-reduced-motion: reduce)').matches")) {
      fail(`${page.file} typewriter must respect reduced-motion preferences`);
    }

    if (/typed(?:\.min)?\.js/i.test(html)) {
      fail(`${page.file} typewriter must not add an external animation dependency`);
    }

    if (!html.includes('src="/publicidad-marcas-hero.jpg?v=20260710-hero4"')) {
      fail(`${page.file} must version the home hero image to avoid stale browser caches`);
    }

    if (!html.includes('class="nexo-hero home-hero overflow-hidden"')) {
      fail(`${page.file} home hero must use the Citofono-aligned proportional layout`);
    }

    if (!html.includes('fetchpriority="high"')) {
      fail(`${page.file} must prioritize the home hero image`);
    }

    if (!html.includes('min-height: 90dvh') || !html.includes('max-width: 1180px')) {
      fail(`${page.file} home hero must match the Citofono viewport and content proportions`);
    }

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
    if (html.includes("Infraestructura tecnológica robusta para garantizar la continuidad del aula digital.")) {
      fail(`${page.file} must not show the removed services subtitle`);
    }

    if (!html.includes('class="services-page-section') || !html.includes('class="compact-page-title')) {
      fail(`${page.file} must use the compact desktop layout`);
    }

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
    if (!html.includes('class="gallery-page-section') || !html.includes('class="compact-page-title')) {
      fail(`${page.file} must use the compact desktop layout`);
    }

    if (!html.includes("assets/generated/galeria-carros-carga-sin-logo.png")) {
      fail(`${page.file} must use the generated charging-cart image without logo or 4K`);
    }

    if (html.includes("publicidad-carros.png")) {
      fail(`${page.file} must not use the old charging-cart gallery image`);
    }
  }
}

if (!sharedBrandCss.includes(".footer-brand-logo")) {
  fail("assets/site-header.css must provide the shared footer logotype style");
}

if (!sharedBrandCss.includes(".site-footer-compact__inner")) {
  fail("assets/site-header.css must provide the shared compact footer layout");
}

if (!sharedBrandCss.includes("min-height: 100dvh") || !sharedBrandCss.includes("margin-top: auto")) {
  fail("assets/site-header.css must keep the footer at the bottom of short pages");
}

if (!sharedTypographyCss.includes(".home-hero h1") || !sharedTypographyCss.includes("font-size: 3.65rem !important")) {
  fail("assets/site-typography.css must match the Citofono hero title scale");
}

if (!sharedTypographyCss.includes("body .compact-page-title")) {
  fail("assets/site-typography.css must provide the compact secondary-page title scale");
}

for (const asset of brandAssets) {
  if (!existsSync(asset) || statSync(asset).size === 0) {
    fail(`missing generated brand asset: ${asset}`);
  }
}

for (const asset of requiredMediaAssets) {
  if (!existsSync(asset) || statSync(asset).size === 0) {
    fail(`missing required media asset: ${asset}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} site hotfix checks failed.`);
  process.exit(1);
}

console.log("Site hotfix checks passed.");
