document.querySelectorAll("a.page-button[href]").forEach((button) => {
  button.addEventListener("click", (event) => {
    const destination = button.getAttribute("href");

    if (!destination) return;

    event.preventDefault();
    document.body.classList.add("page-leaving");

    window.setTimeout(() => {
      window.location.assign(destination);
    }, 220);
  });
});

document.querySelectorAll(".memory-image").forEach((image) => {
  const showPlaceholder = () => image.classList.add("image-missing");

  image.addEventListener("error", showPlaceholder);

  if (image.complete && image.naturalWidth === 0) {
    showPlaceholder();
  }
});

document.querySelectorAll(".memory-video").forEach((video) => {
  const showVideoPlaceholder = () => video.classList.add("video-missing");

  video.addEventListener("error", showVideoPlaceholder);
  video.querySelector("source")?.addEventListener("error", showVideoPlaceholder);
  video.addEventListener("loadedmetadata", () => video.classList.remove("video-missing"));
});

const editableMedia = [
  ...Array.from({ length: 23 }, (_, index) => ({
    id: `photo-${index + 1}`,
    type: "image",
    src: `images/memory-${String(index + 1).padStart(2, "0")}.jpeg`,
    label: `Photo ${index + 1}`
  })),
  { id: "video-1", type: "video", src: "media/memory-video-01.mp4", label: "Video 1" },
  { id: "video-2", type: "video", src: "media/memory-video-02.mp4", label: "Video 2" }
];

const mediaEditor = document.querySelector("#media-editor");
const mediaEditorToggle = document.querySelector("#photo-editor-toggle");
const mediaEditorClose = document.querySelector("#media-editor-close");
const mediaEditorGrid = document.querySelector("#media-editor-grid");
const mediaEditorPreview = document.querySelector("#media-editor-preview");
const mediaEditorSelection = document.querySelector("#media-editor-selection");
const mediaEditorZoom = document.querySelector("#media-editor-zoom");
const mediaEditorRemove = document.querySelector("#media-editor-remove");
const mediaEditorReset = document.querySelector("#media-editor-reset");
const mediaEditorSave = document.querySelector("#media-editor-save");
const mediaEditorExport = document.querySelector("#media-editor-export");
const videoTrimControls = document.querySelector("#video-trim-controls");
const videoTrimStart = document.querySelector("#video-trim-start");
const videoTrimEnd = document.querySelector("#video-trim-end");
const mediaSettingsKey = "khaleeda-media-editor-v1";
let selectedMediaId = editableMedia[0]?.id;

function defaultMediaSetting() {
  return { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null };
}

function loadMediaEditorState() {
  return {
    "images/memory-01.jpeg": { x: 50, y: 47.6533, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-02.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-03.jpeg": { x: 48.7815, y: 46.5702, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-04.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-05.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-06.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-07.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-08.jpeg": { x: 53.9262, y: 74.3696, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-09.jpeg": { x: 43.7722, y: 8.6619, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-10.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-11.jpeg": { x: 50.1354, y: 79.6046, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-12.jpeg": { x: 50.5415, y: 59.2063, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-13.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-14.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-15.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-16.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-17.jpeg": { x: 46.6153, y: 85.02, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-18.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-19.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-20.jpeg": { x: 45.2615, y: 20.937, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-21.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-22.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "images/memory-23.jpeg": { x: 50, y: 50, zoom: 100, hidden: false, start: 0, end: null },
    "media/memory-video-01.mp4": { x: 49.0523, y: 22.2006, zoom: 100, hidden: false, start: 0, end: 6.2 },
    "media/memory-video-02.mp4": { x: 49.4585, y: 62.4556, zoom: 100, hidden: false, start: 0, end: 23.1 }
  };
}

let mediaEditorState = loadMediaEditorState();

editableMedia.forEach((item) => {
  mediaEditorState[item.src] = { ...defaultMediaSetting(), ...(mediaEditorState[item.src] || {}) };
});

function selectedMedia() {
  return editableMedia.find((item) => item.id === selectedMediaId);
}

function selectedMediaSetting() {
  return mediaEditorState[selectedMedia()?.src];
}

function applyMediaStyle(element, setting) {
  if (!element || !setting) return;
  element.style.objectPosition = `${setting.x}% ${setting.y}%`;
  element.style.transform = `scale(${setting.zoom / 100})`;
}

function bindVideoTrim(video, setting) {
  if (!video || !setting || video.dataset.trimBound) return;
  video.dataset.trimBound = "true";
  video.addEventListener("loadedmetadata", () => {
    const end = setting.end == null ? video.duration : Math.min(setting.end, video.duration);
    if (video.currentTime < setting.start || video.currentTime > end) video.currentTime = setting.start;
  });
  video.addEventListener("timeupdate", () => {
    const currentSetting = mediaEditorState[video.querySelector("source")?.getAttribute("src")];
    if (!currentSetting) return;
    const end = currentSetting.end == null ? video.duration : Math.min(currentSetting.end, video.duration);
    if (video.currentTime >= end) {
      video.pause();
      video.currentTime = currentSetting.start;
    }
  });
}

function applyEditorSettingsToPage() {
  document.querySelectorAll(".memory-image").forEach((image) => {
    const setting = mediaEditorState[image.getAttribute("src")];
    if (!setting) return;
    applyMediaStyle(image, setting);
    image.closest(".collection-photo").hidden = setting.hidden;
  });

  document.querySelectorAll(".memory-video").forEach((video) => {
    const src = video.querySelector("source")?.getAttribute("src");
    const setting = mediaEditorState[src];
    if (!setting) return;
    applyMediaStyle(video, setting);
    video.closest(".memory-video-wrap").hidden = setting.hidden;
    bindVideoTrim(video, setting);
  });
}

function renderMediaEditorGrid() {
  if (!mediaEditorGrid) return;
  mediaEditorGrid.replaceChildren();
  editableMedia.forEach((item) => {
    const button = document.createElement("button");
    const setting = mediaEditorState[item.src];
    button.type = "button";
    button.className = "media-editor-thumb";
    button.classList.toggle("is-selected", item.id === selectedMediaId);
    button.classList.toggle("is-removed", setting.hidden);
    button.dataset.mediaId = item.id;

    const media = document.createElement(item.type === "video" ? "video" : "img");
    media.src = item.src;
    if (item.type === "video") media.muted = true;
    media.alt = "";
    button.append(media);

    const label = document.createElement("span");
    label.textContent = item.label;
    button.append(label);
    button.addEventListener("click", () => {
      selectedMediaId = item.id;
      renderMediaEditorGrid();
      renderMediaEditorPreview();
    });
    mediaEditorGrid.append(button);
  });
}

function renderMediaEditorPreview() {
  const item = selectedMedia();
  const setting = selectedMediaSetting();
  if (!item || !setting || !mediaEditorPreview) return;
  mediaEditorPreview.replaceChildren();
  mediaEditorSelection.textContent = item.label;

  const media = document.createElement(item.type === "video" ? "video" : "img");
  media.src = item.src;
  media.draggable = false;
  if (item.type === "video") {
    media.muted = true;
    media.autoplay = true;
    media.loop = false;
    media.playsInline = true;
    media.addEventListener("loadedmetadata", () => {
      if (setting.end == null) setting.end = Number(media.duration.toFixed(1));
      media.currentTime = Math.min(setting.start, media.duration);
      videoTrimEnd.value = setting.end;
    });
    media.addEventListener("timeupdate", () => {
      if (setting.end != null && media.currentTime >= setting.end) media.currentTime = setting.start;
    });
  } else {
    media.alt = item.label;
  }
  applyMediaStyle(media, setting);
  mediaEditorPreview.append(media);

  mediaEditorZoom.value = setting.zoom;
  videoTrimControls.hidden = item.type !== "video";
  if (item.type === "video") {
    videoTrimStart.value = setting.start;
    videoTrimEnd.value = setting.end ?? "";
  }
  mediaEditorRemove.textContent = setting.hidden ? "Restore to Website" : "Remove from Website";
  mediaEditorRemove.classList.toggle("is-removed", setting.hidden);
}

function saveMediaEditorState() {
  localStorage.setItem(mediaSettingsKey, JSON.stringify(mediaEditorState));
  applyEditorSettingsToPage();
}

function openMediaEditor() {
  if (!mediaEditor) return;
  mediaEditor.hidden = false;
  document.body.classList.add("overlay-open");
  renderMediaEditorGrid();
  renderMediaEditorPreview();
}

function closeMediaEditor() {
  if (!mediaEditor) return;
  mediaEditor.hidden = true;
  document.body.classList.remove("overlay-open");
}

let dragStart = null;
mediaEditorPreview?.addEventListener("pointerdown", (event) => {
  dragStart = { pointerX: event.clientX, pointerY: event.clientY, x: selectedMediaSetting().x, y: selectedMediaSetting().y };
  mediaEditorPreview.setPointerCapture(event.pointerId);
});
mediaEditorPreview?.addEventListener("pointermove", (event) => {
  if (!dragStart) return;
  const setting = selectedMediaSetting();
  const rect = mediaEditorPreview.getBoundingClientRect();
  setting.x = Math.max(0, Math.min(100, dragStart.x - ((event.clientX - dragStart.pointerX) / rect.width) * 100));
  setting.y = Math.max(0, Math.min(100, dragStart.y - ((event.clientY - dragStart.pointerY) / rect.height) * 100));
  applyMediaStyle(mediaEditorPreview.firstElementChild, setting);
});
mediaEditorPreview?.addEventListener("pointerup", () => { dragStart = null; });
mediaEditorPreview?.addEventListener("pointercancel", () => { dragStart = null; });

mediaEditorZoom?.addEventListener("input", () => {
  selectedMediaSetting().zoom = Number(mediaEditorZoom.value);
  applyMediaStyle(mediaEditorPreview.firstElementChild, selectedMediaSetting());
});
videoTrimStart?.addEventListener("input", () => {
  selectedMediaSetting().start = Math.max(0, Number(videoTrimStart.value) || 0);
});
videoTrimEnd?.addEventListener("input", () => {
  selectedMediaSetting().end = videoTrimEnd.value === "" ? null : Math.max(0, Number(videoTrimEnd.value));
});
mediaEditorRemove?.addEventListener("click", () => {
  selectedMediaSetting().hidden = !selectedMediaSetting().hidden;
  renderMediaEditorGrid();
  renderMediaEditorPreview();
});
mediaEditorReset?.addEventListener("click", () => {
  mediaEditorState[selectedMedia().src] = defaultMediaSetting();
  renderMediaEditorGrid();
  renderMediaEditorPreview();
});
mediaEditorSave?.addEventListener("click", () => {
  saveMediaEditorState();
  closeMediaEditor();
});
mediaEditorExport?.addEventListener("click", () => {
  saveMediaEditorState();
  const blob = new Blob([JSON.stringify(mediaEditorState, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "khaleeda-memory-settings.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});
mediaEditorToggle?.addEventListener("click", openMediaEditor);
mediaEditorClose?.addEventListener("click", closeMediaEditor);
mediaEditor?.addEventListener("click", (event) => { if (event.target === mediaEditor) closeMediaEditor(); });

applyEditorSettingsToPage();

const memoryModal = document.querySelector("#memory-modal");
const memoryModalTitle = document.querySelector("#memory-modal-title");
const memoryModalPlace = document.querySelector("#memory-modal-place");
const memoryModalStory = document.querySelector("#memory-modal-story");
const memoryModalClose = document.querySelector("#memory-modal-close");
const memoryModalBack = document.querySelector("#memory-modal-back");
let activeMemoryCard = null;

function openMemoryModal(card) {
  if (!memoryModal) return;

  activeMemoryCard = card;
  memoryModalTitle.textContent = card.dataset.memoryTitle || "Our Memory";
  memoryModalPlace.textContent = card.dataset.memoryPlace || "";
  memoryModalStory.textContent = card.dataset.memoryStory || "";
  memoryModal.hidden = false;
  document.body.classList.add("overlay-open");

  requestAnimationFrame(() => {
    memoryModal.classList.add("is-open");
    memoryModalClose?.focus();
  });
}

function closeMemoryModal() {
  if (!memoryModal) return;

  memoryModal.classList.remove("is-open");
  document.body.classList.remove("overlay-open");
  window.setTimeout(() => {
    memoryModal.hidden = true;
    activeMemoryCard?.focus();
    activeMemoryCard = null;
  }, 250);
}

document.querySelectorAll(".memory-card-interactive").forEach((card) => {
  card.addEventListener("click", () => openMemoryModal(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMemoryModal(card);
    }
  });
});

memoryModalClose?.addEventListener("click", closeMemoryModal);
memoryModalBack?.addEventListener("click", closeMemoryModal);
memoryModal?.addEventListener("click", (event) => {
  if (event.target === memoryModal) closeMemoryModal();
});

const galleryModal = document.querySelector("#gallery-modal");
const galleryTitle = document.querySelector("#gallery-title");
const galleryPhoto = document.querySelector("#gallery-photo");
const galleryCaption = document.querySelector("#gallery-caption");
const galleryCounter = document.querySelector("#gallery-counter");
const galleryClose = document.querySelector("#gallery-close");
const galleryPrev = document.querySelector("#gallery-prev");
const galleryNext = document.querySelector("#gallery-next");
let currentGallery = [];
let currentGalleryIndex = 0;
let activeGalleryButton = null;

const dummyPhoto = "images/gallery-dummy.jpg";
const galleries = {
  all: {
    title: "Our Memories ❤️",
    photos: [
      { src: "images/memory-01.jpeg", caption: "One little piece of our story. ❤️" },
      { src: "images/memory-02.jpeg", caption: "You make even the ordinary moments special." },
      { src: "images/memory-03.jpeg", caption: "A smile from you that I’ll always remember." },
      { src: "images/memory-04.jpeg", caption: "My favourite person, being effortlessly beautiful." },
      { src: "images/memory-05.jpeg", caption: "Just us being us. ❤️" },
      { src: "images/memory-06.jpeg", caption: "Another moment I’ll always keep close." },
      { src: "images/memory-07.jpeg", caption: "Every adventure feels better with you." },
      { src: "images/memory-08.jpeg", caption: "Together, right where I want to be." },
      { src: "images/memory-09.jpeg", caption: "A simple moment with my favourite girl." },
      { src: "images/memory-10.jpeg", caption: "Our little world, captured in one photo." },
      { src: "images/memory-11.jpeg", caption: "The random memories always make me smile." },
      { src: "images/memory-12.jpeg", caption: "Every memory feels special when it’s with you." },
      { src: "images/memory-13.jpeg", caption: "Two silly faces, one beautiful memory." },
      { src: "images/memory-14.jpeg", caption: "Proud to be standing beside you. ❤️" },
      { src: "images/memory-15.jpeg", caption: "I’ll always be there to take care of you." },
      { src: "images/memory-16.jpeg", caption: "Good food, sweet smile, perfect memory." },
      { src: "images/memory-17.jpeg", caption: "A quiet moment that means so much to me." },
      { src: "images/memory-18.jpeg", caption: "Even shopping becomes a memory with you." },
      { src: "images/memory-19.jpeg", caption: "Anywhere feels right when you’re beside me." },
      { src: "images/memory-20.jpeg", caption: "Your smile will always be my favourite view." },
      { src: "images/memory-21.jpeg", caption: "Celebrating life and every moment together." },
      { src: "images/memory-22.jpeg", caption: "More adventures, more laughter, more us." },
      { src: "images/memory-23.jpeg", caption: "Just us, making memories together. ❤️" }
    ]
  },
  ioi: {
    title: "IOI City Mall Putrajaya",
    photos: [
      { src: dummyPhoto, caption: "Our first outing together ❤️" },
      { src: dummyPhoto, caption: "A little moment from our IOI day." },
      { src: dummyPhoto, caption: "The beginning of many more memories." }
    ]
  },
  zoo: {
    title: "Zoo Day 🦒",
    photos: [
      { src: dummyPhoto, caption: "A fun day at the zoo." },
      { src: dummyPhoto, caption: "Exploring together, one step at a time." },
      { src: dummyPhoto, caption: "One simple, special day." }
    ]
  },
  aquaria: {
    title: "Aquaria 🐠",
    photos: [
      { src: dummyPhoto, caption: "Our time under the blue lights." },
      { src: dummyPhoto, caption: "Walking through Aquaria together." },
      { src: dummyPhoto, caption: "Simple moments that mean a lot." }
    ]
  },
  birthday: {
    title: "Birthday Memories 🎁",
    photos: [
      { src: dummyPhoto, caption: "A gift and a memory I still treasure." },
      { src: dummyPhoto, caption: "Thank you for making the day special." },
      { src: dummyPhoto, caption: "A moment worth keeping forever." }
    ]
  },
  random: {
    title: "Random Days ❤️",
    photos: [
      { src: dummyPhoto, caption: "Just us being us." },
      { src: dummyPhoto, caption: "The unplanned moments are sometimes the best." },
      { src: dummyPhoto, caption: "Another little piece of our story." }
    ]
  }
};

function renderGalleryPhoto() {
  const photo = currentGallery[currentGalleryIndex];
  if (!photo || !galleryPhoto) return;

  galleryPhoto.src = photo.src;
  galleryPhoto.alt = photo.caption;
  applyMediaStyle(galleryPhoto, mediaEditorState[photo.src]);
  galleryCaption.textContent = photo.caption;
  galleryCounter.textContent = `${currentGalleryIndex + 1} / ${currentGallery.length}`;
}

function openGallery(button) {
  const gallery = galleries[button.dataset.gallery];
  if (!gallery || !galleryModal) return;

  activeGalleryButton = button;
  currentGallery = gallery.photos.filter((photo) => !mediaEditorState[photo.src]?.hidden);
  if (!currentGallery.length) return;
  currentGalleryIndex = 0;
  galleryTitle.textContent = gallery.title;
  renderGalleryPhoto();
  galleryModal.hidden = false;
  document.body.classList.add("overlay-open");

  requestAnimationFrame(() => {
    galleryModal.classList.add("is-open");
    galleryClose?.focus();
  });
}

function closeGallery() {
  if (!galleryModal) return;
  galleryModal.classList.remove("is-open");
  document.body.classList.remove("overlay-open");
  window.setTimeout(() => {
    galleryModal.hidden = true;
    activeGalleryButton?.focus();
    activeGalleryButton = null;
  }, 250);
}

function moveGallery(direction) {
  currentGalleryIndex = (currentGalleryIndex + direction + currentGallery.length) % currentGallery.length;
  renderGalleryPhoto();
}

document.querySelectorAll(".memory-gallery-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openGallery(button);
  });
});

galleryPrev?.addEventListener("click", () => moveGallery(-1));
galleryNext?.addEventListener("click", () => moveGallery(1));
galleryClose?.addEventListener("click", closeGallery);
galleryModal?.addEventListener("click", (event) => {
  if (event.target === galleryModal) closeGallery();
});

const revealSections = document.querySelectorAll(".scroll-reveal");

if (revealSections.length && "IntersectionObserver" in window) {
  document.documentElement.classList.add("reveal-ready");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  revealSections.forEach((section) => revealObserver.observe(section));
}

const finalOverlay = document.querySelector("#final-overlay");
const openFinalButton = document.querySelector("#open-final-surprise");
const closeFinalButton = document.querySelector("#close-final-surprise");
const heartField = document.querySelector("#heart-field");
const finalMusicPlayer = document.querySelector("#final-music-player");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function startFinalMusic() {
  if (!finalMusicPlayer || finalMusicPlayer.children.length) return;

  const iframe = document.createElement("iframe");
  iframe.title = "Our song from YouTube";
  iframe.allow = "autoplay; encrypted-media";
  iframe.src = "https://www.youtube-nocookie.com/embed/57jZJ2QpKRg?autoplay=1&playsinline=1&rel=0";
  finalMusicPlayer.appendChild(iframe);
}

function stopFinalMusic() {
  finalMusicPlayer?.replaceChildren();
}

function createFloatingHearts() {
  if (!heartField || reduceMotion.matches) return;

  heartField.replaceChildren();

  for (let index = 0; index < 18; index += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = index % 4 === 0 ? "✦" : "♥";
    heart.style.setProperty("--heart-left", `${Math.random() * 100}%`);
    heart.style.setProperty("--heart-size", `${14 + Math.random() * 22}px`);
    heart.style.setProperty("--heart-duration", `${4.8 + Math.random() * 3}s`);
    heart.style.setProperty("--heart-delay", `${Math.random() * 1.6}s`);
    heart.style.setProperty("--heart-drift", `${-35 + Math.random() * 70}px`);
    heart.style.setProperty("--heart-color", index % 3 === 0 ? "#ffd2dc" : "#ff8fa8");
    heartField.appendChild(heart);
  }
}

function openFinalSurprise() {
  if (!finalOverlay) return;

  finalOverlay.hidden = false;
  document.body.classList.add("overlay-open");
  createFloatingHearts();
  startFinalMusic();

  requestAnimationFrame(() => {
    finalOverlay.classList.add("is-open");
    closeFinalButton?.focus();
  });
}

function closeFinalSurprise() {
  if (!finalOverlay) return;

  finalOverlay.classList.remove("is-open");
  document.body.classList.remove("overlay-open");

  const finishClosing = () => {
    finalOverlay.hidden = true;
    heartField?.replaceChildren();
    stopFinalMusic();
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
  };

  if (reduceMotion.matches) {
    finishClosing();
  } else {
    window.setTimeout(finishClosing, 400);
  }
}

openFinalButton?.addEventListener("click", openFinalSurprise);
closeFinalButton?.addEventListener("click", closeFinalSurprise);

finalOverlay?.addEventListener("click", (event) => {
  if (event.target === finalOverlay) closeFinalSurprise();
});

document.addEventListener("keydown", (event) => {
  if (galleryModal?.classList.contains("is-open")) {
    if (event.key === "Escape") closeGallery();
    if (event.key === "ArrowLeft") moveGallery(-1);
    if (event.key === "ArrowRight") moveGallery(1);
    return;
  }

  if (event.key === "Escape" && memoryModal?.classList.contains("is-open")) {
    closeMemoryModal();
  }

  if (event.key === "Escape" && finalOverlay?.classList.contains("is-open")) {
    closeFinalSurprise();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const floatingImages = [
    "images/random-1.jpeg",
    "images/random-2.jpeg",
    "images/random-3.jpeg",
    "images/random-4.jpeg",
    "images/random-5.jpeg",
    "images/random-6.jpeg",
    "images/random-7.jpeg",
    "images/random-8.jpeg",
    "images/random-9.jpeg",
    "images/random-10.jpeg",
    "images/random-11.jpeg",
    "images/random-12.jpeg",
    "images/random-13.jpeg",
    "images/random-14.jpeg",
    "images/random-15.jpeg"
  ];

  const totalImages = floatingImages.length * 2; // Gandakan jadi 30 keping
  const cols = 6;
  const rows = 5;
  const cellWidth = 100 / cols; 
  const cellHeight = 100 / rows;
  
  // Campurkan gambar (shuffle)
  let imageList = [];
  for(let i=0; i<totalImages; i++) {
    imageList.push(floatingImages[i % floatingImages.length]);
  }
  imageList.sort(() => Math.random() - 0.5);

  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (count >= totalImages) break;

      const img = document.createElement("img");
      img.src = imageList[count];
      img.className = "random-floating-image";
      
      // Saiz secara rawak (100px ke 170px)
      const size = Math.floor(Math.random() * 70) + 100; 
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      
      // Kedudukan (grid + sikit pergerakan rawak/jitter supaya nampak natural)
      const jitterX = Math.random() * (cellWidth * 0.5); 
      const jitterY = Math.random() * (cellHeight * 0.5); 
      
      const posX = (c * cellWidth) + jitterX; 
      const posY = (r * cellHeight) + jitterY; 
      
      img.style.left = `${posX}vw`;
      img.style.top = `${posY}vh`;
      
      const rotation = Math.floor(Math.random() * 80) - 40; 
      img.style.transform = `rotate(${rotation}deg)`;
      
      document.body.appendChild(img);
      count++;
    }
  }
});
