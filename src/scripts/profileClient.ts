/* eslint-disable @typescript-eslint/no-explicit-any */
const HIGHLIGHT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

declare global {
  interface Window {
    __TRANSLATIONS__?: Record<string, any>;
    __CURRENT_LANG__?: string;
    highlightCache?: Record<string, { items: any[]; timestamp: number }>;
    currentProfileData?: {
      username: string;
      fullName: string;
      bio: string;
      profileImage: string;
      posts: any[];
      stories: any[];
      highlights: any[];
    };
    currentHighlightTitle?: string | null;
    currentHighlightId?: string | null;
    trackEvent?: (...args: any[]) => void;
    trackHighlightView?: (label: string) => void;
    trackStoryView?: (label: string) => void;
    trackPostView?: (url: string) => void;
    trackOutboundLink?: (url: string) => void;
    trackButtonClick?: (label: string) => void;
    trackError?: (message: string, context?: string) => void;
    trackSearch?: (username: string) => void;
    __proxyImgFallback?: (img: HTMLImageElement) => void;
    __proxyImgLoaded?: (img: HTMLImageElement) => void;
  }
}

const highlightLoading = new Set<string>();

let tabHandlersInitialized = false;

function escapeHtmlAttr(value: string): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getMediaSources(url?: string) {
  if (!url) {
    return { proxyUrl: '', originalUrl: '' };
  }

  return {
    proxyUrl: `/api/image-proxy?url=${encodeURIComponent(url)}`,
    originalUrl: url
  };
}

function initializeMediaElement(img: HTMLImageElement) {
  if (!img || img.dataset.fallbackInitialized === 'true') return;
  img.dataset.fallbackInitialized = 'true';
  img.dataset.proxyFailed = img.dataset.proxyFailed || 'false';

  const fallbackEl = img.nextElementSibling instanceof HTMLElement && img.nextElementSibling.classList.contains('image-fallback')
    ? img.nextElementSibling
    : null;

  img.addEventListener('load', () => {
    img.dataset.proxyFailed = 'false';
    if (fallbackEl) {
      fallbackEl.style.display = 'none';
    }
  });

  img.addEventListener('error', () => {
    const originalSrc = img.getAttribute('data-original-src');
    const currentSrc = img.getAttribute('src');
    const hasRetried = img.dataset.proxyFailed === 'true';

    if (!hasRetried && originalSrc && currentSrc !== originalSrc) {
      img.dataset.proxyFailed = 'true';
      img.src = originalSrc;
      return;
    }

    if (fallbackEl) {
      fallbackEl.style.display = 'flex';
    }
  });
}

function initializeMediaElements(root: ParentNode) {
  root.querySelectorAll('img[data-original-src], img[data-proxy-src]').forEach((node) => {
    initializeMediaElement(node as HTMLImageElement);
  });
}

function setImageSource(img: HTMLImageElement | null, url?: string) {
  if (!img) return;

  if (!url) {
    img.removeAttribute('src');
    img.removeAttribute('data-original-src');
    img.removeAttribute('data-proxy-src');
    return;
  }

  const { proxyUrl, originalUrl } = getMediaSources(url);
  if (originalUrl) {
    img.setAttribute('data-original-src', originalUrl);
  } else {
    img.removeAttribute('data-original-src');
  }

  if (proxyUrl) {
    img.setAttribute('data-proxy-src', proxyUrl);
    img.src = proxyUrl;
  } else {
    img.removeAttribute('data-proxy-src');
    img.src = originalUrl;
  }

  initializeMediaElement(img);
}

function setVideoSource(video: HTMLVideoElement | null, url?: string) {
  if (!video) return;

  const source = video.querySelector('source');

  if (!url) {
    if (source) source.removeAttribute('src');
    video.removeAttribute('src');
    return;
  }

  const { proxyUrl, originalUrl } = getMediaSources(url);
  let triedOriginal = false;

  const assignSrc = (src: string) => {
    if (!src) return;
    if (source) {
      source.src = src;
    } else {
      video.src = src;
    }
    video.load();
  };

  video.onerror = () => {
    if (!triedOriginal && originalUrl) {
      triedOriginal = true;
      assignSrc(originalUrl);
    }
  };

  assignSrc(proxyUrl || originalUrl);
}

const translations = window.__TRANSLATIONS__ || {};
const currentLang = window.__CURRENT_LANG__ || 'en';

const usernameInput = document.getElementById('usernameInput') as HTMLInputElement | null;
const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement | null;
const languageSelect = document.getElementById('languageSelect') as HTMLSelectElement | null;
const userTags = Array.from(document.querySelectorAll('.user-tag')) as HTMLElement[];
const faqItems = Array.from(document.querySelectorAll('.faq-item')) as HTMLElement[];
const profileDisplay = document.getElementById('profileDisplay') as HTMLElement | null;

const messages = {
  pleaseEnterUsername: t('messages.pleaseEnterUsername', 'Please enter a username'),
  pleaseEnterValidUsername: t('messages.pleaseEnterValidUsername', 'Please enter a valid username'),
  foundProfile: t('messages.foundProfile', 'Found profile:'),
  profileNotFound: t('messages.profileNotFound', 'Profile not found'),
  errorConnecting: t('messages.errorConnecting', 'Error connecting to server. Please try again.'),
  loading: t('messages.loading', 'Loading...'),
  retry: t('messages.retry', 'Retry')
};

let storyModalPreviouslyFocused: Element | null = null;
let postModalPreviouslyFocused: Element | null = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  initializeFAQ();
  initializeLanguageSelector();
  addInteractiveAnimations();
  registerGlobalFocusStyles();
  initializeMediaElements(document);
});

function t(key: string, fallback = ''): string {
  const keys = key.split('.');
  let value: any = translations;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return fallback;
  }
  return value || fallback;
}

function initializeEventListeners() {
  if (!usernameInput || !searchBtn) return;

  searchBtn.addEventListener('click', handleSearch);
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  userTags.forEach((tag) => {
    tag.addEventListener('click', function handleTagClick() {
      const username = (this.textContent || '').replace('@', '');
      if (!usernameInput) return;
      usernameInput.value = username;
      window.trackEvent?.('User Action', 'click_popular_tag', username);
      handleSearch();
    });
  });

  const ctaButton = document.querySelector('.btn-primary');
  if (ctaButton && usernameInput) {
    ctaButton.addEventListener('click', () => {
      window.trackButtonClick?.('CTA Button');
      usernameInput.scrollIntoView({ behavior: 'smooth' });
      usernameInput.focus();
    });
  }
}

function handleSearch() {
  if (!usernameInput || !searchBtn) return;

  const username = usernameInput.value.trim();
  if (!username) {
    showMessage(messages.pleaseEnterUsername, 'error');
    return;
  }

  const cleanUsername = username
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/\/$/, '')
    .trim();

  if (!cleanUsername) {
    showMessage(messages.pleaseEnterValidUsername, 'error');
    return;
  }

  window.trackSearch?.(cleanUsername);

  searchBtn.disabled = true;
  searchBtn.dataset.originalLabel = searchBtn.dataset.originalLabel || searchBtn.textContent || '';
  searchBtn.textContent = messages.loading || 'Loading...';

  fetch(`/api/full/${cleanUsername}`)
    .then(async (response) => {
      if (!response.ok) {
        window.trackError?.(`API response error: ${response.status}`, 'handleSearch');
      }
      try {
        return await response.json();
      } catch (error) {
        window.trackError?.('Failed to parse JSON response', 'handleSearch');
        throw error;
      }
    })
    .then((data) => {
      restoreSearchButton();
      if (data?.success) {
        showMessage(`${messages.foundProfile} @${cleanUsername}`, 'success');
        showProfileData(data.data);
      } else {
        window.trackError?.(data?.error || 'Profile not found', 'handleSearch');
        showMessage(data?.error || messages.profileNotFound, 'error', {
          actionLabel: messages.retry,
          onAction: handleSearch
        });
      }
    })
    .catch((error) => {
      restoreSearchButton();
      console.error('Fetch error:', error);
      window.trackError?.(error?.message || 'Network error', 'handleSearch');
      showMessage(messages.errorConnecting, 'error', {
        actionLabel: messages.retry,
        onAction: handleSearch
      });
    });
}

function restoreSearchButton() {
  if (!searchBtn) return;
  const original = searchBtn.dataset.originalLabel || t('hero.button', 'Search');
  searchBtn.textContent = original;
  searchBtn.disabled = false;
}

function initializeFAQ() {
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => toggleFAQ(item));
  });
}

function toggleFAQ(item: HTMLElement) {
  const isActive = item.classList.contains('active');
  faqItems.forEach((faqItem) => faqItem.classList.remove('active'));
  if (!isActive) {
    item.classList.add('active');
  }
}

function initializeLanguageSelector() {
  if (!languageSelect) return;
  languageSelect.addEventListener('change', () => {
    const selected = (languageSelect.value || 'en').toLowerCase();
    if (selected === currentLang) return;
    const target = selected === 'en' ? '/' : `/${selected}/`;
    window.location.href = target;
  });
}

function showProfileData(apiData: any) {
  const profileData = apiData.profile || {};
  const postsDataRaw = apiData.posts || {};
  const storiesDataRaw = apiData.stories || {};
  const highlightsDataRaw = apiData.highlights || {};

  if (!profileData || Object.keys(profileData).length === 0) {
    showMessage('Profile information is temporarily unavailable.', 'error');
    return;
  }

  const username = profileData.username || apiData.username;
  const fullName = profileData.full_name || username;
  const bio = profileData.biography || 'No bio available.';
  const profileImage = profileData.profile_pic_url || profileData.profile_picture || '';

  const followersCountRaw = typeof profileData.followers_count === 'number' ? profileData.followers_count : null;
  const followersText = profileData.followers_text || '';
  const followersDisplay = followersCountRaw !== null
    ? formatNumber(followersCountRaw)
    : followersText.replace(/followers?/i, '').trim() || 'N/A';
  const followingCountRaw = typeof profileData.following_count === 'number' ? profileData.following_count : null;

  const profileUsername = document.getElementById('profileUsername');
  const profileName = document.getElementById('profileName');
  const profileBio = document.getElementById('profileBio');
  const postsCountEl = document.getElementById('postsCount');
  const followersCountEl = document.getElementById('followersCount');
  const followingCountEl = document.getElementById('followingCount');
  const profileImageEl = document.getElementById('profileImage') as HTMLImageElement | null;

  profileUsername && (profileUsername.textContent = `@${username}`);
  profileName && (profileName.textContent = fullName);
  profileBio && (profileBio.textContent = bio);

  if (profileImageEl && profileImage) {
    profileImageEl.alt = fullName;
    setImageSource(profileImageEl, profileImage);
    profileImageEl.addEventListener('error', function handleProfileImageError() {
      if (this.dataset.proxyFailed !== 'true' && this.getAttribute('data-original-src')) {
        return;
      }
      this.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.style.cssText = 'width:100px; height:100px; background:#f3f4f6; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#9ca3af; font-size:12px; text-align:center;';
      fallback.textContent = 'Profile image blocked by Instagram';
      this.parentNode?.insertBefore(fallback, this);
    });
  }

  const posts = normalizeMedia(postsDataRaw, { fallbackKey: 'posts' });
  const stories = normalizeMedia(storiesDataRaw, { fallbackKey: 'stories' });
  const highlights = normalizeMedia(highlightsDataRaw, { fallbackKey: 'highlights' });

  const postsCount = typeof profileData.posts_count === 'number' && profileData.posts_count >= 0
    ? profileData.posts_count
    : posts.length;

  postsCountEl && (postsCountEl.textContent = `${formatNumber(postsCount)} posts`);
  followersCountEl && (followersCountEl.textContent = `${followersDisplay} followers`);
  followingCountEl && (followingCountEl.textContent = followingCountRaw !== null ? `${formatNumber(followingCountRaw)} following` : 'N/A following');

  window.currentProfileData = {
    username,
    fullName,
    bio,
    profileImage,
    posts,
    stories,
    highlights
  };

  window.highlightCache = {};
  window.currentHighlightTitle = null;
  window.currentHighlightId = null;

  profileDisplay && (profileDisplay.style.display = 'block');
  profileDisplay?.scrollIntoView({ behavior: 'auto', block: 'start' });

  window.trackProfileView?.(username);
  loadPosts(window.currentProfileData.posts);

  setupTabHandlers();
}

function setupTabHandlers() {
  if (tabHandlersInitialized) return;
  tabHandlersInitialized = true;
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', function handleTabClick() {
      tabButtons.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      const currentData = window.currentProfileData;
      if (!currentData) return;
      const tabName = this.getAttribute('data-tab');
      switchTab(tabName, currentData);
    });
  });
}

function switchTab(tabName: string | null, profileData: any) {
  switch (tabName) {
    case 'stories':
      loadStories(profileData.stories || []);
      break;
    case 'posts':
      loadPosts(profileData.posts || []);
      break;
    case 'highlights':
      window.trackHighlightView?.(window.currentProfileData?.username || 'unknown');
      loadHighlights(profileData.highlights || []);
      break;
    default:
      loadPosts(profileData.posts || []);
  }
}

function loadStories(stories: any[]) {
  const contentGrid = document.getElementById('contentGrid');
  if (!contentGrid) return;

  if (!stories || stories.length === 0) {
    contentGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">No stories available. Stories are only accessible through IGStoryPeek service.</div>';
    return;
  }

  const storiesContent = stories
    .map((story, index) => renderStoryCard(story, index))
    .join('');
  contentGrid.innerHTML = storiesContent;
  initializeMediaElements(contentGrid);

  Array.from(contentGrid.querySelectorAll('.story-item')).forEach((item, index) => {
    item.addEventListener('click', () => {
      openStory(stories[index], {
        storiesList: stories,
        context: 'stories'
      });
    });
  });
}

function renderStoryCard(story: any, index: number): string {
  const node = story.node || story;
  const isVideo = node.is_video || node.media_type === 2;
  const imageVersions = node.image_versions2?.candidates || [];
  const thumbnailUrl = imageVersions.length > 0 ? imageVersions[0].url : '';
  const { proxyUrl, originalUrl } = getMediaSources(thumbnailUrl);
  const initialSrc = proxyUrl || originalUrl;
  const showFallback = initialSrc ? 'display:none;' : 'display:flex;';
  const videoIcon = isVideo ? '<div class="video-indicator"><i class="fas fa-play"></i></div>' : '';

  return `
    <div class="content-item story-item" data-story-index="${index}">
      ${initialSrc ? `<img src="${initialSrc}" alt="Story" loading="lazy" data-proxy-src="${proxyUrl || ''}" data-original-src="${originalUrl || ''}" />` : ''}
      <div class="image-fallback" style="${showFallback} width:100%; height:100%; background:#f3f4f6; align-items:center; justify-content:center; color:#9ca3af; font-size:14px;">
        <span>Story blocked by Instagram</span>
      </div>
      ${videoIcon}
      <div class="story-overlay"><i class="fas fa-eye"></i></div>
    </div>
  `;
}

function loadPosts(posts: any[]) {
  const contentGrid = document.getElementById('contentGrid');
  if (!contentGrid) return;

  if (!posts || posts.length === 0) {
    contentGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">No posts available.</div>';
    return;
  }

  const postsContent = posts
    .map((post, index) => renderPostCard(post, index))
    .join('');
  contentGrid.innerHTML = postsContent;
  initializeMediaElements(contentGrid);

  Array.from(contentGrid.querySelectorAll('.post-item')).forEach((item, index) => {
    item.addEventListener('click', () => openPostModal(posts[index]));
  });
}

function renderPostCard(post: any, index: number): string {
  const node = post.node || post;
  const isVideo = node.media_type === 2 || node.is_video;
  const imageVersions = node.image_versions2?.candidates || [];
  const mediaUrl = imageVersions.length > 0 ? imageVersions[0].url : '';
  const { proxyUrl, originalUrl } = getMediaSources(mediaUrl);
  const initialSrc = proxyUrl || originalUrl;
  const showFallback = initialSrc ? 'display:none;' : 'display:flex;';
  const caption = node.caption?.text || 'Instagram Post';
  const likes = node.like_count || 0;
  const comments = node.comment_count || 0;
  const videoIcon = isVideo ? '<div class="video-indicator"><i class="fas fa-play"></i></div>' : '';

  return `
    <div class="content-item post-item" data-post-index="${index}">
      ${initialSrc ? `<img src="${initialSrc}" alt="${escapeHtmlAttr(caption.substring(0, 50))}..." loading="lazy" data-proxy-src="${proxyUrl || ''}" data-original-src="${originalUrl || ''}" />` : ''}
      <div class="image-fallback" style="${showFallback} width:100%; height:100%; background:#f3f4f6; align-items:center; justify-content:center; color:#9ca3af; font-size:14px;">
        <span>Image blocked by Instagram</span>
      </div>
      ${videoIcon}
      <div class="post-stats">
        <span><i class="fas fa-heart"></i> ${formatNumber(likes)}</span>
        <span><i class="fas fa-comment"></i> ${formatNumber(comments)}</span>
      </div>
    </div>
  `;
}

function loadHighlights(highlights: any[]) {
  const contentGrid = document.getElementById('contentGrid');
  if (!contentGrid) return;

  if (!highlights || highlights.length === 0) {
    contentGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">No highlights available.</div>';
    return;
  }

  const highlightsContent = highlights.map(renderHighlightCard).join('');
  contentGrid.innerHTML = highlightsContent;
  initializeMediaElements(contentGrid);

  Array.from(contentGrid.querySelectorAll('.highlight-item')).forEach((item) => {
    item.addEventListener('click', async function handleHighlightClick() {
      const highlightId = decodeDatasetValue(this.dataset.highlightId);
      const highlightTitle = decodeDatasetValue(this.dataset.highlightTitle);
      const highlightUrl = decodeDatasetValue(this.dataset.highlightUrl);
      await openHighlight(highlightId, highlightTitle, highlightUrl, this as HTMLElement);
    });
  });
}

function renderHighlightCard(highlight: any): string {
  const node = highlight.node || highlight;
  const coverMedia = node.cover_media || {};
  const coverCandidates = coverMedia.image_versions2?.candidates || [];
  const coverUrl = coverCandidates.length > 0
    ? coverCandidates[0].url
    : coverMedia.cropped_image_version?.url || coverMedia.thumbnail_image?.url || '';
  const title = node.title || 'Highlight';
  const highlightUrl = `https://www.instagram.com/stories/highlights/${node.id}/`;
  const { proxyUrl, originalUrl } = getMediaSources(coverUrl);
  const initialSrc = proxyUrl || originalUrl;
  const fallbackDisplay = coverUrl ? 'display:none;' : 'display:flex;';
  const fallbackLabel = coverUrl ? 'Preview unavailable' : (title?.trim()?.charAt(0) || '☆');

  return `
    <div class="content-item highlight-item" data-highlight-id="${encodeURIComponent(node.id || '')}" data-highlight-title="${encodeURIComponent(title)}" data-highlight-url="${encodeURIComponent(highlightUrl)}">
      ${initialSrc ? `<img src="${initialSrc}" alt="${escapeHtmlAttr(title)}" loading="lazy" data-proxy-src="${proxyUrl || ''}" data-original-src="${originalUrl || ''}" />` : ''}
      <div class="image-fallback" data-state="${coverUrl ? 'loading' : 'empty'}" style="${fallbackDisplay} width:100%; height:100%; background:#f3f4f6; border-radius:12px; align-items:center; justify-content:center; color:#4b5563; font-size:14px; font-weight:500; text-align:center; padding:0.75rem;">
        <span>${fallbackLabel}</span>
      </div>
      <div class="highlight-overlay"><span>${title}</span></div>
    </div>
  `;
}

function normalizeMedia(raw: any, options: { fallbackKey?: string } = {}) {
  if (!raw || typeof raw === 'string' || raw.error || raw.message) return [];
  let list: any[] = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (Array.isArray(raw.items)) {
    list = raw.items;
  } else if (Array.isArray(raw.nodes)) {
    list = raw.nodes;
  } else if (Array.isArray(raw.posts)) {
    list = raw.posts;
  } else if (Array.isArray(raw.edges)) {
    list = raw.edges;
  } else if (raw.data) {
    return normalizeMedia(raw.data, options);
  } else if (options.fallbackKey && Array.isArray(raw[options.fallbackKey])) {
    list = raw[options.fallbackKey];
  }

  return list
    .flatMap((item) => (Array.isArray(item?.edges) ? item.edges : [item]))
    .map((item) => item?.node || item)
    .filter(Boolean);
}

function formatNumber(num: number | string): string {
  if (num === null || num === undefined) return '0';
  if (typeof num === 'string') return num;
  if (Number.isNaN(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

let currentStories: any[] = [];
let currentStoryIndex = 0;
let storyProgressInterval: ReturnType<typeof setInterval> | undefined;
let storyAutoAdvanceTimeout: ReturnType<typeof setTimeout> | undefined;

function openStory(storyData: any, options: { storiesList?: any[]; context?: string; highlightTitle?: string; highlightId?: string } = {}) {
  const providedStories = Array.isArray(options.storiesList) ? options.storiesList : (window.currentProfileData?.stories || []);
  currentStories = providedStories.length > 0 ? providedStories : [storyData];

  currentStoryIndex = currentStories.findIndex((story) => JSON.stringify(story) === JSON.stringify(storyData));
  if (currentStoryIndex === -1) currentStoryIndex = 0;

  if (options.context === 'highlight') {
    window.currentHighlightTitle = options.highlightTitle || window.currentHighlightTitle || 'Highlight';
    window.currentHighlightId = options.highlightId || window.currentHighlightId || '';
  } else {
    window.currentHighlightTitle = null;
    window.currentHighlightId = null;
  }

  const username = window.currentProfileData?.username || 'unknown';
  window.trackStoryView?.(username);

  const activeStory = currentStories[currentStoryIndex] || storyData;
  showStoryModal(activeStory);
}

function showStoryModal(storyData: any) {
  const modal = document.getElementById('storyModal');
  const storyImage = document.getElementById('storyImage') as HTMLImageElement | null;
  const storyVideo = document.getElementById('storyVideo') as HTMLVideoElement | null;
  const storyUserAvatar = document.getElementById('storyUserAvatar') as HTMLImageElement | null;
  const storyUsername = document.getElementById('storyUsername');
  const storyTime = document.getElementById('storyTime');
  const storyProgress = document.getElementById('storyProgress') as HTMLElement | null;

  if (!modal || !storyImage || !storyVideo || !storyUserAvatar || !storyUsername || !storyTime || !storyProgress) return;

  storyModalPreviouslyFocused = document.activeElement;

  const node = storyData.node || storyData;
  const username = window.currentProfileData?.username || 'unknown';
  const highlightLabel = window.currentHighlightTitle;
  storyUsername.textContent = highlightLabel ? `${highlightLabel} • @${username}` : `@${username}`;
  const timestampLabel = highlightLabel ? 'Highlight' : formatStoryTimestamp(node.taken_at);
  storyTime.textContent = timestampLabel;
  storyUserAvatar.src = window.currentProfileData?.profileImage || '';

  const isVideo = node.is_video || node.media_type === 2;
  const imageVersions = node.image_versions2?.candidates || [];
  const videoVersions = node.video_versions || [];

  storyImage.style.display = 'none';
  storyVideo.style.display = 'none';
  storyVideo.pause();

  if (isVideo && videoVersions.length > 0) {
    const videoUrl = videoVersions[0].url;
    storyVideo.style.display = 'block';
    setVideoSource(storyVideo, videoUrl);
  } else if (imageVersions.length > 0) {
    const imageUrl = imageVersions[0].url;
    setImageSource(storyImage, imageUrl);
    storyImage.style.display = 'block';
  }

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  trapFocus(modal);

  startStoryProgress();

  clearTimeout(storyAutoAdvanceTimeout);
  storyAutoAdvanceTimeout = setTimeout(() => {
    window.trackEvent?.('Content', 'story_auto_advance', window.currentHighlightId || username);
    nextStory();
  }, 5000);
}

function startStoryProgress() {
  const storyProgress = document.getElementById('storyProgress') as HTMLElement | null;
  if (!storyProgress) return;

  storyProgress.style.width = '0%';
  let progress = 0;
  clearInterval(storyProgressInterval);
  storyProgressInterval = setInterval(() => {
    progress += 2;
    storyProgress.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(storyProgressInterval);
      window.trackEvent?.('Content', 'story_progress_complete', window.currentHighlightId || window.currentProfileData?.username || 'unknown');
    }
  }, 100);
}

function nextStory() {
  if (currentStories.length === 0) return;
  clearInterval(storyProgressInterval);
  clearTimeout(storyAutoAdvanceTimeout);
  currentStoryIndex = (currentStoryIndex + 1) % currentStories.length;
  showStoryModal(currentStories[currentStoryIndex]);
}

function previousStory() {
  if (currentStories.length === 0) return;
  clearInterval(storyProgressInterval);
  clearTimeout(storyAutoAdvanceTimeout);
  currentStoryIndex = currentStoryIndex === 0 ? currentStories.length - 1 : currentStoryIndex - 1;
  showStoryModal(currentStories[currentStoryIndex]);
}

let currentPostUrl = '';

function openPostModal(postData: any) {
  const modal = document.getElementById('postModal');
  const postImage = document.getElementById('postModalImage') as HTMLImageElement | null;
  const postVideo = document.getElementById('postModalVideo') as HTMLVideoElement | null;
  const postUserAvatar = document.getElementById('postUserAvatar') as HTMLImageElement | null;
  const postUsername = document.getElementById('postUsername');
  const postLikes = document.getElementById('postModalLikes');
  const postComments = document.getElementById('postModalComments');
  const postCaption = document.getElementById('postModalCaption');

  if (!modal || !postImage || !postVideo || !postUserAvatar || !postUsername || !postLikes || !postComments || !postCaption) return;

  postModalPreviouslyFocused = document.activeElement;

  const node = postData.node || postData;
  const isVideo = node.media_type === 2 || node.is_video;
  const imageVersions = node.image_versions2?.candidates || [];
  const videoVersions = node.video_versions || [];
  const caption = node.caption?.text || '';
  const likes = node.like_count || 0;
  const comments = node.comment_count || 0;
  const postUrl = `https://www.instagram.com/p/${node.code}/`;

  const username = window.currentProfileData?.username || 'unknown';
  postUsername.textContent = `@${username}`;
  postUserAvatar.src = window.currentProfileData?.profileImage || '';
  postLikes.innerHTML = `<i class="fas fa-heart"></i> ${formatNumber(likes)}`;
  postComments.innerHTML = `<i class="fas fa-comment"></i> ${formatNumber(comments)}`;
  postCaption.textContent = caption;

  window.trackPostView?.(postUrl);
  currentPostUrl = postUrl;

  postImage.style.display = 'none';
  postVideo.style.display = 'none';
  postVideo.pause();

  if (isVideo && videoVersions.length > 0) {
    const videoUrl = videoVersions[0].url;
    postVideo.style.display = 'block';
    setVideoSource(postVideo, videoUrl);
  } else if (imageVersions.length > 0) {
    const imageUrl = imageVersions[0].url;
    setImageSource(postImage, imageUrl);
    postImage.style.display = 'block';
  }

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  trapFocus(modal);
}

function closeStoryModal() {
  const modal = document.getElementById('storyModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  clearInterval(storyProgressInterval);
  clearTimeout(storyAutoAdvanceTimeout);
  window.currentHighlightTitle = null;
  window.currentHighlightId = null;
  releaseFocus(modal, storyModalPreviouslyFocused);
}

function closePostModal() {
  const modal = document.getElementById('postModal');
  const postVideo = document.getElementById('postModalVideo') as HTMLVideoElement | null;
  if (!modal || !postVideo) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  postVideo.pause();
  postVideo.currentTime = 0;
  releaseFocus(modal, postModalPreviouslyFocused);
}

function viewPostOnInstagram() {
  if (currentPostUrl) {
    window.trackOutboundLink?.(currentPostUrl);
    window.open(currentPostUrl, '_blank');
  }
}

const storyModalEl = document.getElementById('storyModal');
const postModalEl = document.getElementById('postModal');

storyModalEl?.addEventListener('click', (event) => {
  if (event.target === storyModalEl) {
    closeStoryModal();
  }
});

postModalEl?.addEventListener('click', (event) => {
  if (event.target === postModalEl) {
    closePostModal();
  }
});

document.addEventListener('keydown', (event) => {
  const storyModal = document.getElementById('storyModal');
  const postModal = document.getElementById('postModal');

  if (storyModal && storyModal.style.display === 'flex') {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        previousStory();
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextStory();
        break;
      case 'Escape':
        event.preventDefault();
        closeStoryModal();
        break;
      case 'Tab':
        maintainFocus(event, storyModal);
        break;
    }
  } else if (postModal && postModal.style.display === 'flex') {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePostModal();
    } else if (event.key === 'Tab') {
      maintainFocus(event, postModal);
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    faqItems.forEach((item) => item.classList.remove('active'));
  }
});

async function openHighlight(highlightId: string, highlightTitle: string, fallbackUrl: string, tile?: HTMLElement) {
  const safeId = (highlightId || '').trim();
  const fallback = fallbackUrl || (safeId ? `https://www.instagram.com/stories/highlights/${safeId.replace(/^highlight:/, '')}/` : '');

  if (!safeId) {
    if (fallback) window.open(fallback, '_blank');
    return;
  }

  if (!window.highlightCache) {
    window.highlightCache = {};
  }

  const cacheEntry = window.highlightCache[safeId];
  const now = Date.now();
  if (cacheEntry && now - cacheEntry.timestamp < HIGHLIGHT_CACHE_TTL) {
    openHighlightStories(cacheEntry.items, safeId, highlightTitle);
    return;
  }

  if (highlightLoading.has(safeId)) return;
  highlightLoading.add(safeId);
  tile?.classList.add('is-loading');
  window.trackEvent?.('Content', 'highlight_fetch_start', safeId);

  try {
    const response = await fetch(`/api/highlights/${encodeURIComponent(safeId)}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to load highlight stories');
    }

    const stories = normalizeHighlightStories(result.data?.items || result.data || []);
    window.highlightCache[safeId] = { items: stories, timestamp: Date.now() };
    window.trackEvent?.('Content', 'highlight_fetch_success', `${safeId}:${stories.length}`);
    openHighlightStories(stories, safeId, highlightTitle);
  } catch (error: any) {
    console.error('Unable to load highlight stories:', error);
    window.trackEvent?.('Error', 'highlight_fetch_error', safeId);
    window.trackError?.(error?.message || 'Unknown highlight error', 'openHighlight');
    showMessage('Unable to load highlight stories right now.', 'error', {
      actionLabel: messages.retry,
      onAction: () => openHighlight(highlightId, highlightTitle, fallbackUrl, tile)
    });
    if (fallback) window.open(fallback, '_blank');
  } finally {
    highlightLoading.delete(safeId);
    tile?.classList.remove('is-loading');
  }
}

function openHighlightStories(highlightStories: any[], safeId: string, highlightTitle: string) {
  if (!highlightStories || highlightStories.length === 0) {
    showMessage('No stories found in this highlight yet.', 'info');
    return;
  }

  window.currentHighlightTitle = highlightTitle || 'Highlight';
  window.currentHighlightId = safeId;
  window.trackHighlightView?.(`${window.currentProfileData?.username || 'unknown'}:${window.currentHighlightTitle}`);
  openStory(highlightStories[0], {
    storiesList: highlightStories,
    context: 'highlight',
    highlightTitle: window.currentHighlightTitle,
    highlightId: safeId
  });
}

function showMessage(message: string, type: 'error' | 'success' | 'info', options: { actionLabel?: string; onAction?: () => void } = {}) {
  const existingMessages = document.querySelectorAll('.message');
  existingMessages.forEach((msg) => msg.remove());

  const container = document.createElement('div');
  container.className = `message ${type}`;
  container.textContent = message;
  container.setAttribute('role', type === 'error' ? 'alert' : 'status');
  container.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  if (options.actionLabel && options.onAction) {
    const actionButton = document.createElement('button');
    actionButton.className = 'message-action';
    actionButton.type = 'button';
    actionButton.textContent = options.actionLabel;
    actionButton.addEventListener('click', options.onAction);
    actionButton.setAttribute('aria-label', options.actionLabel);
    container.appendChild(actionButton);
  }

  const searchContainer = document.querySelector('.search-container');
  if (searchContainer && searchContainer.parentNode) {
    searchContainer.parentNode.insertBefore(container, searchContainer.nextSibling);
  }

  setTimeout(() => {
    container.remove();
  }, 8000);
}

function addInteractiveAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement;
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card, .step').forEach((el) => {
    const element = el as HTMLElement;
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
  });
}

function registerGlobalFocusStyles() {
  const focusableElements = document.querySelectorAll('button, input, select, a');
  focusableElements.forEach((el) => {
    el.addEventListener('focus', function handleFocus() {
      (this as HTMLElement).style.outline = '2px solid #667eea';
      (this as HTMLElement).style.outlineOffset = '2px';
    });

    el.addEventListener('blur', function handleBlur() {
      (this as HTMLElement).style.outline = 'none';
    });
  });
}

function decodeDatasetValue(value?: string) {
  if (typeof value !== 'string') return '';
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function normalizeHighlightStories(items: any[]) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => item?.node || item).filter(Boolean);
}

function formatStoryTimestamp(takenAt?: number) {
  if (!takenAt) return '';
  const nowSeconds = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, nowSeconds - takenAt);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3_600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3_600)}h ago`;
  const days = Math.floor(diff / 86_400);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

function trapFocus(modal: HTMLElement) {
  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(modal.querySelectorAll(focusableSelectors)) as HTMLElement[];
  if (focusable.length === 0) return;
  focusable[0].focus();
}

function maintainFocus(event: KeyboardEvent, modal: HTMLElement) {
  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(modal.querySelectorAll(focusableSelectors)) as HTMLElement[];
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function releaseFocus(modal: HTMLElement, previouslyFocused: Element | null) {
  modal.setAttribute('aria-hidden', 'true');
  if (previouslyFocused instanceof HTMLElement) {
    previouslyFocused.focus();
  }
}

const postModalClose = document.querySelector('.post-close');
postModalClose?.addEventListener('click', closePostModal);

const storyModalClose = document.querySelector('.story-close');
storyModalClose?.addEventListener('click', closeStoryModal);

const viewPostBtn = document.querySelector('.btn-view-post');
viewPostBtn?.addEventListener('click', viewPostOnInstagram);

const storyNavLeft = document.querySelector('.story-nav-left');
const storyNavRight = document.querySelector('.story-nav-right');
storyNavLeft?.addEventListener('click', previousStory);
storyNavRight?.addEventListener('click', nextStory);

const postModal = document.getElementById('postModal');
postModal?.setAttribute('aria-hidden', postModal?.style.display === 'flex' ? 'false' : 'true');

const storyModal = document.getElementById('storyModal');
storyModal?.setAttribute('aria-hidden', storyModal?.style.display === 'flex' ? 'false' : 'true');

export {};

