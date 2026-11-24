// MissAV 源组件（CapyPlayer）v1.0.0
// 接 missav.ai 这一个站。missav.live / .fans / .media / .ai / .ws 只是同一站的不同后缀，
// 域名切换只是换后缀，路径结构、页面结构、接口完全相同；探活在后缀之间选，首选 missav.ai。
// 严格按 CapyPlayer 组件开发指南编写：
// https://capyplayer.feifeiduck.com/en/dev/widget/widgetdev
// 关键约定：var WidgetMetadata；数据源函数一律返回数组、空结果返回 []；
// 每个枚举参数都有 value 默认值（首页预览只传默认参数）；详情条目 type "link" + link；
// HTML 解析只用 Widget.dom（不用 Rex 的 Widget.html.load）；网络只用 Widget.http。

var MISSAV_MAIN_SITE = "https://missav.ai";
var MISSAV_SITE = MISSAV_MAIN_SITE;
var SITE_CANDIDATES = [
  "https://missav.ai",
  "https://missav.live",
  "https://missav.fans",
  "https://missav.media",
  "https://missav.ws"
];
var RESOLVED_SITE = "";
var MISSAV_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)";
var MISSAV_BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0";

// TOP 榜单静态番号表（取自 0922 的 RANKINGS，各榜前 50；JavLibrary 500 条过长未收录）
var RANKING_CODES = {"javdb":["LAFBD-41","SSNI-497","IPX-811","ABP-984","STARS-804","SONE-855","IPX-580","IPX-177","SMBD-115","ABF-017","IPX-697","ABP-159","CAWD-365","IPX-534","IPX-726","STARS-979","IPX-536","IPX-776","IPX-118","CWPBD-120","LULU-234","MIAB-317","MIDA-234","ABW-096","PRED-483","DASS-092","MIDA-439","ABW-087","IPX-620","ABP-968","IPX-149","SHKD-744","CAWD-243","IPX-867","PFES-107","IPX-743","NMSL-030","IPZZ-037","SSIS-465","SMD-115","ABW-108","MIDA-039","121914-760","MIAB-043","LAF-41","SMBD-136","ABP-933","CJOD-439","STARS-734","MEYD-831"],"javdbCensored":["SSNI-497","IPX-811","ABP-984","STARS-804","SONE-855","IPX-580","IPX-177","ABF-017","IPX-697","ABP-159","CAWD-365","IPX-534","IPX-726","STARS-979","IPX-536","IPX-776","IPX-118","LULU-234","MIAB-317","MIDA-234","ABW-096","PRED-483","DASS-092","MIDA-439","ABW-087","IPX-620","ABP-968","IPX-149","SHKD-744","CAWD-243","IPX-867","PFES-107","IPX-743","NMSL-030","SSIS-465","IPZZ-037","ABW-108","MIDA-039","MIAB-043","ABP-933","CJOD-439","STARS-734","MEYD-831","MEYD-605","IPX-633","IPZZ-003","MIDV-530","ABF-087","SONE-308","PRED-193"],"javdbUncensored":["LAFBD-41","SMBD-115","CWPBD-120","SMD-115","121914-760","LAF-41","SMBD-136","MKBD-S03","010115_001","HEYZO-0783","CWP-120","MKBD-S89","HEYZO-1031","SMBD-108","SKY-247","SMD-136","092415_159","SKYHD-084","MKBD-S94","MKBD-S127","CWPBD-138","012318-589","CWPBD-99","032715_004","n0659","SKYHD-088","EMP-002","MKD-S127","040415-846","032715_001","032715_002","MKBD-S77","CWPBD-126","CWPBD-104","S2MBD-050","n0646","n1042","052716-172","MKD-S03","n0417","CWPBD-46","SMBD-55","MKD-S89","n1049","MKBD-S118","042817-420","CWPBD-112","n0536","SMBD-126","021015-803"],"javdbFc2":["FC2-PPV-4025269","FC2-PPV-3061625","FC2-PPV-3175924","FC2-PPV-1616189","FC2-PPV-2498047","FC2-PPV-2526023","FC2-PPV-1560667","FC2-PPV-1602707","FC2-PPV-4162750","FC2-PPV-3363283","FC2-PPV-3788088","FC2-PPV-1261799","FC2-PPV-3292343","FC2-PPV-238629","FC2-PPV-3119569","FC2-PPV-2386297","FC2-PPV-2751830","FC2-PPV-3087371","FC2-PPV-880652","FC2-PPV-2763672","FC2-PPV-3121790","FC2-PPV-2953018","FC2-PPV-2643836","FC2-PPV-1309765","FC2-PPV-2549115","FC2-PPV-1940513","FC2-PPV-1932561","FC2-PPV-1909413","FC2-PPV-1462524","FC2-PPV-1288053","FC2-PPV-3264420","FC2-PPV-2711719","FC2-PPV-2486345","FC2-PPV-3104502","FC2-PPV-3972175","FC2-PPV-3237031","FC2-PPV-1912367","FC2-PPV-835964","FC2-PPV-2935820","FC2-PPV-2760723","FC2-PPV-1050737","FC2-PPV-2246125","FC2-PPV-2932490","FC2-PPV-2767346","FC2-PPV-2724256","FC2-PPV-3059148","FC2-PPV-402422","FC2-PPV-3111155","FC2-PPV-1245249","FC2-PPV-2802445"]};

var WidgetMetadata = {
  id: "missav",
  title: "MissAV",
  description: "MissAV 视频源：最新更新、今日热门、分类浏览、搜索、TOP 榜单",
  version: "1.0.0",
  site: "https://missav.ai",
  icon: "https://missav.ai/favicon.ico",
  globalParams: [
    {
      name: "missav_cookie",
      title: "MissAV Cookie（可选）",
      type: "string",
      description: "不填也能用；被风控时可填入浏览器里抓到的 MissAV Cookie",
      value: ""
    }
  ],
  modules: [
    {
      id: "new",
      title: "最新更新",
      type: "media_list",
      functionName: "getNewVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "filter", title: "筛选", type: "enum", value: "all",
          enumOptions: [
            { title: "全部", value: "all" },
            { title: "单人", value: "individual" },
            { title: "多人", value: "multiple" },
            { title: "中文字幕", value: "chinese-subtitle" }
          ]
        },
        {
          name: "sort_by", title: "排序", type: "enum", value: "published_at",
          enumOptions: [
            { title: "最新发布", value: "released_at" },
            { title: "最近更新", value: "published_at" },
            { title: "今日热门", value: "today_views" },
            { title: "本周热门", value: "weekly_views" },
            { title: "本月热门", value: "monthly_views" },
            { title: "播放量", value: "views" }
          ]
        },
        { name: "page", title: "页码", type: "page", value: "1" }
      ]
    },
    {
      id: "hot",
      title: "今日热门",
      type: "media_list",
      functionName: "getTodayHot",
      cacheDuration: 1800,
      params: [
        {
          name: "filter", title: "筛选", type: "enum", value: "all",
          enumOptions: [
            { title: "全部", value: "all" },
            { title: "单人", value: "individual" },
            { title: "多人", value: "multiple" },
            { title: "中文字幕", value: "chinese-subtitle" }
          ]
        },
        {
          name: "sort_by", title: "排序", type: "enum", value: "today_views",
          enumOptions: [
            { title: "最新发布", value: "released_at" },
            { title: "最近更新", value: "published_at" },
            { title: "今日热门", value: "today_views" },
            { title: "本周热门", value: "weekly_views" },
            { title: "本月热门", value: "monthly_views" },
            { title: "播放量", value: "views" }
          ]
        },
        { name: "page", title: "页码", type: "page", value: "1" }
      ]
    },
    {
      id: "genres",
      title: "分类浏览",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm817/cn/uncensored-leak",
          enumOptions: [
            { title: "无码流出", value: MISSAV_SITE + "/dm817/cn/uncensored-leak" },
            { title: "麻豆传媒", value: MISSAV_SITE + "/dm63/cn/madou" },
            { title: "高清", value: MISSAV_SITE + "/dm96/cn/genres/%E9%AB%98%E6%B8%85" },
            { title: "人妻", value: MISSAV_SITE + "/dm81/cn/genres/%E4%BA%BA%E5%A6%BB" },
            { title: "中出", value: MISSAV_SITE + "/dm133/cn/genres/%E4%B8%AD%E5%87%BA" },
            { title: "巨乳", value: MISSAV_SITE + "/dm156/cn/genres/%E5%B7%A8%E4%B9%B3" },
            { title: "自拍", value: MISSAV_SITE + "/dm978/cn/genres/%E8%87%AA%E6%8B%8D" },
            { title: "4小时以上", value: MISSAV_SITE + "/dm755/cn/genres/4%E5%B0%8F%E6%97%B6%E4%BB%A5%E4%B8%8A" },
            { title: "企划", value: MISSAV_SITE + "/dm349/cn/genres/%E4%BC%81%E5%88%92" },
            { title: "SF", value: MISSAV_SITE + "/dm1/cn/genres/SF" }
          ]
        },
        {
          name: "filter", title: "筛选", type: "enum", value: "all",
          enumOptions: [
            { title: "全部", value: "all" },
            { title: "单人", value: "individual" },
            { title: "多人", value: "multiple" },
            { title: "中文字幕", value: "chinese-subtitle" }
          ]
        },
        {
          name: "sort_by", title: "排序", type: "enum", value: "released_at",
          enumOptions: [
            { title: "最新发布", value: "released_at" },
            { title: "最近更新", value: "published_at" },
            { title: "今日热门", value: "today_views" },
            { title: "本周热门", value: "weekly_views" },
            { title: "本月热门", value: "monthly_views" },
            { title: "播放量", value: "views" }
          ]
        },
        { name: "page", title: "页码", type: "page", value: "1" }
      ]
    },
    {
      id: "search",
      title: "搜索影片",
      type: "media_list",
      functionName: "searchVideos",
      cacheDuration: 600,
      params: [
        { name: "keyword", title: "搜索关键词", type: "string", value: "" },
        {
          name: "sort_by", title: "排序", type: "enum", value: "released_at",
          enumOptions: [
            { title: "最新发布", value: "released_at" },
            { title: "最近更新", value: "published_at" },
            { title: "今日热门", value: "today_views" },
            { title: "本周热门", value: "weekly_views" },
            { title: "本月热门", value: "monthly_views" },
            { title: "播放量", value: "views" }
          ]
        },
        { name: "page", title: "页码", type: "page", value: "1" }
      ]
    },
    {
      id: "ranking",
      title: "TOP 榜单",
      type: "media_list",
      functionName: "getRanking",
      cacheDuration: 3600,
      params: [
        {
          name: "ranking", title: "榜单", type: "enum", value: "javdb",
          enumOptions: [
            { title: "JavDB TOP250", value: "javdb" },
            { title: "JavDB 有码 TOP250", value: "javdbCensored" },
            { title: "JavDB 无码 TOP250", value: "javdbUncensored" },
            { title: "JavDB FC2 TOP250", value: "javdbFc2" }
          ]
        },
        { name: "max_items", title: "最大加载数", type: "number", value: "20" }
      ]
    }
  ]
};

// ---------------- 基础工具 ----------------

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function isBlockedHtml(data) {
  var text = String(data || "");
  return !text ||
    text.indexOf("Just a moment") >= 0 ||
    text.indexOf("cf-browser-verification") >= 0 ||
    text.indexOf("Attention Required") >= 0 ||
    text.indexOf("Cloudflare") >= 0;
}

function getCookie(params) {
  return String((params && params.missav_cookie) || "").trim();
}

function withCookie(headers, params) {
  headers = Object.assign({}, headers || {});
  var cookie = getCookie(params);
  if (cookie) headers["Cookie"] = cookie;
  return headers;
}

function getPageHeaders(referer, ua) {
  var headers = {
    "User-Agent": ua || MISSAV_UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": referer || MISSAV_SITE + "/"
  };
  if ((ua || MISSAV_UA) === MISSAV_BROWSER_UA) {
    headers["Sec-Ch-Ua"] = "\"Microsoft Edge\";v=\"149\", \"Chromium\";v=\"149\", \"Not(A:Brand\";v=\"24\"";
    headers["Sec-Ch-Ua-Mobile"] = "?0";
    headers["Sec-Ch-Ua-Platform"] = "\"Windows\"";
    headers["Sec-Fetch-Dest"] = "document";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-Site"] = "same-origin";
    headers["Upgrade-Insecure-Requests"] = "1";
  }
  return headers;
}

function getPlayHeaders(referer) {
  return {
    "User-Agent": MISSAV_UA,
    "Referer": referer || MISSAV_SITE + "/"
  };
}

// ---------------- 域名：只换后缀 ----------------
// live / fans / media / ai / ws 是同一站的不同后缀，路径与页面结构完全相同，
// 所以改写只需把 host 换成当前后缀；探活也是在后缀之间选第一个可用的。
function applySite(host) {
  if (!host) return;
  MISSAV_SITE = host;
  RESOLVED_SITE = host;
}

function rewriteToCurrentSite(url) {
  if (!url) return url;
  return String(url).replace(/^https?:\/\/missav\.[a-z0-9.-]+/i, MISSAV_SITE);
}

async function ensureSite() {
  if (RESOLVED_SITE) return RESOLVED_SITE;
  for (var i = 0; i < SITE_CANDIDATES.length; i++) {
    var host = SITE_CANDIDATES[i];
    try {
      var res = await Widget.http.get(host + "/dm539/cn/new", {
        headers: getPageHeaders(host + "/", MISSAV_UA)
      });
      var html = res && res.data ? String(res.data) : "";
      if (html && !isBlockedHtml(html)) {
        applySite(host);
        return host;
      }
    } catch (e) { /* 换下一个后缀 */ }
  }
  applySite(SITE_CANDIDATES[0]);
  return SITE_CANDIDATES[0];
}

// ---------------- 请求层（只用 Widget.http） ----------------

function getHttpStatus(error) {
  if (!error) return 0;
  var response = error.response || error.Response || {};
  return error.status || error.statusCode || response.status || response.statusCode || 0;
}

function isRetryableMissavError(error) {
  var status = getHttpStatus(error);
  var text = String((error && (error.message || (error.toString && error.toString()))) || "");
  return status === 403 || status === 429 ||
    text.indexOf("status code of 403") >= 0 ||
    text.indexOf("status code of 429") >= 0;
}

async function requestMissavPage(url, params, referer) {
  var delays = [0, 700];
  var uaList = getCookie(params) ? [MISSAV_BROWSER_UA, MISSAV_UA] : [MISSAV_UA, MISSAV_BROWSER_UA];
  var lastError = null;
  var blockedSeen = false;

  for (var i = 0; i < delays.length; i++) {
    if (delays[i] > 0) await sleep(delays[i]);
    for (var j = 0; j < uaList.length; j++) {
      try {
        var response = await Widget.http.get(url, {
          headers: withCookie(getPageHeaders(referer, uaList[j]), params)
        });
        if (response && response.data && !isBlockedHtml(response.data)) {
          return response;
        }
        if (response && response.data && isBlockedHtml(response.data)) blockedSeen = true;
        lastError = new Error("blocked or empty response");
      } catch (error) {
        lastError = error;
        if (!isRetryableMissavError(error)) throw error;
        blockedSeen = true;
      }
    }
  }

  if (blockedSeen) RESOLVED_SITE = "";
  throw lastError || new Error("request failed");
}

function buildMissavListUrl(baseUrl, params, defaultSort) {
  params = params || {};
  var query = [];
  var filter = String(params.filter || "all").trim();
  var sort = String(params.sort_by || defaultSort || "").trim();
  if (filter && filter !== "all") query.push("filters=" + encodeURIComponent(filter));
  if (sort) query.push("sort=" + encodeURIComponent(sort));
  return baseUrl + (query.length ? "?" + query.join("&") : "");
}

async function fetchVideoList(url, params) {
  await ensureSite();
  url = rewriteToCurrentSite(url);
  try {
    var response = await requestMissavPage(url, params, MISSAV_SITE + "/");
    return parseVideoList(response.data, params);
  } catch (error) {
    console.error("fetchVideoList failed", url, error && error.message);
    return [];
  }
}

// ---------------- 列表解析（只用 Widget.dom） ----------------

function extractVideoId(url) {
  var matches = String(url || "").match(/\/cn\/([a-zA-Z0-9\-]+)(-uncensored-leak)?$/);
  return matches ? matches[1] : String(url || "").split("/").pop();
}

function getBaseVideoId(videoId) {
  return String(videoId || "")
    .trim()
    .replace(/-chinese-subtitle$/i, "")
    .replace(/-uncensored-leak$/i, "")
    .replace(/^([a-z]+-\d+)-2$/i, "$1");
}

function normalizeImageUrl(url) {
  url = String(url || "").trim();
  if (!url) return "";
  if (url.indexOf("//") === 0) url = "https:" + url;
  else if (/^https?:\/\//i.test(url)) { /* 原样 */ }
  else if (url.charAt(0) === "/") url = MISSAV_SITE + url;
  // 封面统一走 fourhoi.mrstcdn.store；小图 cover-t 换成大图 cover-n
  url = url.replace(/^https?:\/\/fourhoi\.com\//i, "https://fourhoi.mrstcdn.store/");
  url = url.replace(/\/cover-t\.jpg(?=([?#]|$))/i, "/cover-n.jpg");
  return url;
}

function getFourhoiCoverUrl(videoId) {
  return "https://fourhoi.mrstcdn.store/" + String(videoId || "").toLowerCase() + "/cover-n.jpg";
}

function parseDurationToSeconds(text) {
  var m = String(text || "").match(/(\d{1,3}):(\d{2})(?::(\d{2}))?/);
  if (!m) return 0;
  if (m[3] !== undefined) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  return Number(m[1]) * 60 + Number(m[2]);
}

function buildVideoItem(href, innerHtml, cardText, params) {
  if (!href || !/\/((cn|dm\d+)\/)[a-zA-Z0-9\-]+(-uncensored-leak)?$/.test(href)) return null;
  var imgTagMatch = String(innerHtml || "").match(/<img\b[^>]*>/i);
  var imgTag = imgTagMatch ? imgTagMatch[0] : "";
  var srcMatch = imgTag.match(/data-src="([^"]+)"/i) || imgTag.match(/src="([^"]+)"/i);
  var imgSrc = srcMatch ? srcMatch[1] : "";
  if (!imgSrc) return null;

  var title = "";
  var titleMatch = String(innerHtml || "").match(/<a\b[^>]*title="([^"]*)"/i);
  if (titleMatch) title = titleMatch[1];
  if (!title) {
    var altMatch = imgTag.match(/alt="([^"]*)"/i);
    if (altMatch) title = altMatch[1];
  }
  if (!title) {
    title = String(cardText || "")
      .replace(/\b\d{1,3}:\d{2}(?::\d{2})?\b/g, "")
      .replace(/中文字幕/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  var videoId = extractVideoId(href);
  var videoCode = getBaseVideoId(videoId).toUpperCase();
  if (title && title.toUpperCase().indexOf(videoCode) < 0) {
    title = videoCode + " " + title;
  } else if (!title) {
    title = videoCode;
  }

  var durationMatch = String(cardText || "").match(/\b\d{1,3}:\d{2}(?::\d{2})?\b/);
  var durationText = durationMatch ? durationMatch[0] : "";
  var cover = normalizeImageUrl(imgSrc) || getFourhoiCoverUrl(videoId);
  var fullUrl = /^https?:\/\//i.test(href) ? rewriteToCurrentSite(href) : MISSAV_SITE + href;
  var descParts = ["番号: " + videoCode];
  if (durationText) descParts.push("时长: " + durationText);

  return {
    id: videoId,
    type: "link",
    title: title,
    mediaType: "movie",
    posterUrl: cover,
    backdropUrl: cover,
    description: descParts.join("\n"),
    duration: parseDurationToSeconds(durationText),
    durationText: durationText,
    link: fullUrl
  };
}

function parseVideoList(html, params) {
  var docId = Widget.dom.parse(html);
  try {
    var items = [];
    var seen = {};
    var cards = Widget.dom.select(docId, "div.thumbnail") || [];
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var inner = card.html || "";
      var hrefMatch = inner.match(/<a\b[^>]*href="([^"]+)"/i);
      var href = hrefMatch ? hrefMatch[1] : "";
      var item = buildVideoItem(href, inner, Widget.dom.text(card), params);
      if (item && !seen[item.id]) {
        seen[item.id] = true;
        items.push(item);
      }
    }
    if (!items.length) {
      // 兜底：页面没有 div.thumbnail 结构时，直接扫带图的链接
      var anchors = Widget.dom.select(docId, "a") || [];
      for (var j = 0; j < anchors.length; j++) {
        var anchor = anchors[j];
        var anchorHref = Widget.dom.attr(anchor, "href") || "";
        var item2 = buildVideoItem(anchorHref, anchor.html || "", Widget.dom.text(anchor), params);
        if (item2 && !seen[item2.id]) {
          seen[item2.id] = true;
          items.push(item2);
        }
      }
    }
    return items;
  } finally {
    Widget.dom.remove(docId);
  }
}

// ---------------- 数据源函数（必须返回数组） ----------------

async function getNewVideos(params) {
  params = params || {};
  var page = parseInt(params.page, 10) || 1;
  var url = buildMissavListUrl(MISSAV_SITE + "/dm539/cn/new", params, "published_at");
  if (page > 1) url += (url.indexOf("?") >= 0 ? "&" : "?") + "page=" + page;
  return await fetchVideoList(url, params);
}

async function getTodayHot(params) {
  params = params || {};
  var page = parseInt(params.page, 10) || 1;
  var url = buildMissavListUrl(MISSAV_SITE + "/dm301/cn/today-hot", params, "today_views");
  if (page > 1) url += (url.indexOf("?") >= 0 ? "&" : "?") + "page=" + page;
  return await fetchVideoList(url, params);
}

async function getGenreVideos(params) {
  params = params || {};
  // 守卫：url 缺失/为空/是字面量 "undefined" 时不发请求，直接返回空数组
  // （正常情况下 url 永远有默认值，这个守卫只是按指南“空结果返回 []”兜底）
  var rawUrl = String(params.url || "").trim();
  if (!rawUrl || rawUrl === "undefined") {
    return [];
  }
  await ensureSite();
  var baseUrl = rewriteToCurrentSite(rawUrl);
  var page = parseInt(params.page, 10) || 1;
  var url = buildMissavListUrl(baseUrl, params, "released_at");
  if (page > 1) url += (url.indexOf("?") >= 0 ? "&" : "?") + "page=" + page;
  return await fetchVideoList(url, params);
}

async function searchVideos(params) {
  params = params || {};
  var keyword = params.keyword ? String(params.keyword).trim() : "";
  if (!keyword) {
    return [];
  }
  var page = parseInt(params.page, 10) || 1;
  var url = buildMissavListUrl(
    MISSAV_SITE + "/cn/search/" + encodeURIComponent(keyword),
    params,
    "released_at"
  );
  if (page > 1) url += (url.indexOf("?") >= 0 ? "&" : "?") + "page=" + page;
  return await fetchVideoList(url, params);
}

function isFc2VideoId(videoId) {
  return /^fc2(?:[-_ ]?ppv)?[-_ ]?\d+$/i.test(getBaseVideoId(videoId));
}

function getRankingVideoIdCandidates(videoId) {
  var rawVideoId = String(videoId || "").trim().toLowerCase();
  var paddedVideoId = rawVideoId.replace(/^(.*-)(\d+)$/, function (_, prefix, number) {
    return prefix + number.padStart(3, "0");
  });
  var candidates = isFc2VideoId(rawVideoId)
    ? [paddedVideoId, rawVideoId]
    : [
      paddedVideoId + "-uncensored-leak",
      rawVideoId + "-uncensored-leak",
      paddedVideoId,
      rawVideoId
    ];
  return candidates.filter(function (candidate, index) {
    return candidates.indexOf(candidate) === index;
  });
}

async function mapWithConcurrency(items, limit, worker) {
  var results = new Array(items.length);
  var nextIndex = 0;
  async function runOne() {
    while (nextIndex < items.length) {
      var current = nextIndex++;
      try {
        results[current] = await worker(items[current], current);
      } catch (e) {
        results[current] = null;
      }
    }
  }
  var runners = [];
  var count = Math.max(1, Math.min(limit, items.length));
  for (var i = 0; i < count; i++) runners.push(runOne());
  await Promise.all(runners);
  return results;
}

async function getRanking(params) {
  params = params || {};
  await ensureSite();
  var key = String(params.ranking || "javdb");
  var codes = RANKING_CODES[key] || RANKING_CODES.javdb || [];
  var requested = parseInt(params.max_items, 10);
  var maxItems = Math.max(1, Math.min(codes.length, Number.isFinite(requested) ? requested : 20));
  var entries = codes.slice(0, maxItems);
  var results = await mapWithConcurrency(entries, 8, async function (code) {
    var videoId = String(code).toLowerCase();
    var candidates = getRankingVideoIdCandidates(videoId);
    for (var i = 0; i < candidates.length; i++) {
      try {
        var res = await requestMissavPage(
          MISSAV_SITE + "/cn/" + candidates[i],
          params,
          MISSAV_SITE + "/"
        );
        var html = String(res && res.data || "");
        if (!html || isBlockedHtml(html)) continue;
        var docId = Widget.dom.parse(html);
        try {
          var title = metaContent(docId, "og:title") || "";
          // 404 页也会返回非拦截 HTML：标题里必须含有该番号才算命中，否则换下一个候选
          if (!title || title.toUpperCase().indexOf(getBaseVideoId(candidates[i]).toUpperCase()) < 0) continue;
          var duration = Number(metaContent(docId, "og:video:duration")) || 0;
          var cover = getFourhoiCoverUrl(candidates[i]);
          return {
            id: candidates[i],
            type: "link",
            title: title || getBaseVideoId(candidates[i]).toUpperCase(),
            mediaType: "movie",
            posterUrl: cover,
            backdropUrl: cover,
            duration: duration,
            link: MISSAV_SITE + "/cn/" + candidates[i]
          };
        } finally {
          Widget.dom.remove(docId);
        }
      } catch (e) { /* 换下一个候选番号 */ }
    }
    return null;
  });
  return results.filter(Boolean);
}

// ---------------- 详情页 ----------------

function metaContent(docId, property) {
  var nodes = Widget.dom.select(docId, 'meta[property="' + property + '"]') || [];
  if (!nodes.length) return "";
  return String(Widget.dom.attr(nodes[0], "content") || "").trim();
}

function firstText(docId, selector) {
  var nodes = Widget.dom.select(docId, selector) || [];
  if (!nodes.length) return "";
  return String(Widget.dom.text(nodes[0]) || "").trim();
}

// 类型/女优/导演：详情页里是 "<span>类型:</span> … <a>…</a> … </div>" 结构，
// 对原始 HTML 做小范围正则提取（与 0922 验证过的办法一致，不走 HTML 解析器）。
function parseMissavGenres(html) {
  var typeMatch = String(html || "").match(/<span>\s*类型:\s*<\/span>([\s\S]*?)<\/div>/i);
  if (!typeMatch) return [];
  var genres = [];
  var linkPattern = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  var match;
  while ((match = linkPattern.exec(typeMatch[1]))) {
    var genre = match[1].replace(/<[^>]*>/g, "").trim();
    if (genre) genres.push(genre);
  }
  return genres;
}

function parseMissavPeople(html) {
  var text = String(html || "");
  function parseField(label) {
    var fieldMatch = text.match(new RegExp(
      "<span>\\s*" + label + ":\\s*<\\/span>([\\s\\S]*?)<\\/div>", "i"
    ));
    if (!fieldMatch) return [];
    var entries = [];
    var linkPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;
    while ((match = linkPattern.exec(fieldMatch[1]))) {
      var name = match[2].replace(/<[^>]*>/g, "").trim();
      if (name) entries.push({ id: match[1], name: name });
    }
    return entries;
  }
  return {
    actresses: parseField("女优"),
    directors: parseField("导演")
  };
}

function extractMissavUuid(html) {
  html = String(html || "");
  var nineyuMatch = html.match(/nineyu\.com\\?\/([a-f0-9-]{36})\\?\/seek\\?\/_0\.jpg/i);
  if (nineyuMatch && nineyuMatch[1]) return nineyuMatch[1];
  var surritMatch = html.match(/https?:\\?\/\\?\/surrit\.com\\?\/([a-f0-9-]{36})\\?\//i);
  if (surritMatch && surritMatch[1]) return surritMatch[1];
  var uuidMatches = html.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/ig);
  return uuidMatches && uuidMatches.length ? uuidMatches[0] : "";
}

function parseM3u8Variants(masterText, uuid) {
  var prefix = "https://surrit.com/" + uuid + "/";
  var lines = String(masterText || "")
    .split(/\r?\n/)
    .map(function (line) { return line.trim(); })
    .filter(Boolean);
  var variants = [];
  for (var i = 0; i < lines.length - 1; i++) {
    var info = lines[i];
    var bwMatch = info.match(/^#EXT-X-STREAM-INF:.*BANDWIDTH=(\d+)/i);
    if (!bwMatch) continue;
    var uri = lines[i + 1];
    if (!uri || uri.charAt(0) === "#" || uri.indexOf(".m3u8") < 0) continue;
    var resMatch = info.match(/RESOLUTION=(\d+)x(\d+)/i);
    var height = resMatch ? Number(resMatch[2]) : 0;
    var url = /^https?:\/\//i.test(uri) ? uri : prefix + uri.replace(/^\/+/, "");
    variants.push({
      bandwidth: Number(bwMatch[1]),
      height: height,
      title: height ? height + "p" : "线路" + (variants.length + 1),
      videoUrl: url
    });
  }
  variants.sort(function (a, b) { return b.bandwidth - a.bandwidth; });
  return variants;
}

function pickBestM3u8(masterText, uuid) {
  var variants = parseM3u8Variants(masterText, uuid);
  if (variants.length) return variants[0].videoUrl;
  var prefix = "https://surrit.com/" + uuid + "/";
  var lines = String(masterText || "")
    .split(/\r?\n/)
    .map(function (line) { return line.trim(); })
    .filter(Boolean);
  var videoLines = lines.filter(function (line) { return line.indexOf("/video.m3u8") >= 0; });
  if (videoLines.length) {
    var best = videoLines[videoLines.length - 1];
    return /^https?:\/\//i.test(best) ? best : prefix + best.replace(/^\/+/, "");
  }
  var firstM3u8 = lines.find(function (line) { return line.indexOf(".m3u8") >= 0 && line[0] !== "#"; });
  if (firstM3u8) {
    return /^https?:\/\//i.test(firstM3u8) ? firstM3u8 : prefix + firstM3u8.replace(/^\/+/, "");
  }
  return prefix + "playlist.m3u8";
}

async function resolveMissavVideoUrl(html, detailUrl) {
  var uuid = extractMissavUuid(html);
  if (!uuid) return { videoUrl: "", playSources: [], uuid: "" };
  var playlistUrl = "https://surrit.com/" + uuid + "/playlist.m3u8";
  try {
    var response = await Widget.http.get(playlistUrl, {
      headers: getPlayHeaders(detailUrl)
    });
    var masterText = (response && response.data) || "";
    var variants = parseM3u8Variants(masterText, uuid);
    if (variants.length > 1) {
      return {
        videoUrl: "",
        playSources: variants.map(function (v, idx) {
          return {
            id: "line-" + (idx + 1),
            title: v.title,
            videoUrl: v.videoUrl,
            isDefault: idx === 0
          };
        }),
        uuid: uuid
      };
    }
    return { videoUrl: pickBestM3u8(masterText, uuid), playSources: [], uuid: uuid };
  } catch (error) {
    return { videoUrl: playlistUrl, playSources: [], uuid: uuid };
  }
}

async function resolveVideoUrlWithFallback(html, detailUrl, docId) {
  var resolved = await resolveMissavVideoUrl(html, detailUrl);
  if (resolved.videoUrl || (resolved.playSources && resolved.playSources.length)) {
    return resolved;
  }
  // 兜底：扫 <script> 里的 surrit 直链或 eval 打包脚本里的 UUID
  var scripts = Widget.dom.select(docId, "script") || [];
  for (var i = 0; i < scripts.length; i++) {
    var scriptContent = Widget.dom.text(scripts[i]) || scripts[i].html || "";
    if (scriptContent.indexOf("surrit.com") >= 0 && scriptContent.indexOf(".m3u8") >= 0) {
      var surritMatches = scriptContent.match(/https:\/\/surrit\.com\/[a-f0-9\-]+\/[^"'\s]*\.m3u8/g);
      if (surritMatches && surritMatches.length > 0) {
        return { videoUrl: surritMatches[0], playSources: [], uuid: "" };
      }
    }
    if (scriptContent.indexOf("eval(function") >= 0) {
      var uuidMatches = scriptContent.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g);
      if (uuidMatches && uuidMatches.length > 0) {
        return { videoUrl: "https://surrit.com/" + uuidMatches[0] + "/playlist.m3u8", playSources: [], uuid: uuidMatches[0] };
      }
    }
  }
  return { videoUrl: "", playSources: [], uuid: "" };
}

async function loadDetail(link) {
  var originalLink = link;
  if (link && typeof link === "object") {
    originalLink = link.detailUrl || link.link || link.id || link.url || "";
  }
  var detailUrl = rewriteToCurrentSite(String(originalLink || ""));
  var videoId = extractVideoId(detailUrl);
  var videoCode = getBaseVideoId(videoId).toUpperCase();
  var cover = getFourhoiCoverUrl(videoId);

  await ensureSite();
  detailUrl = rewriteToCurrentSite(detailUrl);

  var response;
  try {
    response = await requestMissavPage(detailUrl, {}, MISSAV_SITE + "/");
  } catch (error) {
    console.error("loadDetail request failed", detailUrl, error && error.message);
    return {
      id: detailUrl,
      title: videoCode,
      mediaType: "movie",
      posterUrl: cover,
      backdropUrl: cover,
      description: "番号: " + videoCode + "\n详情页加载失败，可能已被风控，请稍后重试",
      videoUrl: ""
    };
  }

  var html = String(response && response.data || "");
  if (!html || isBlockedHtml(html)) {
    return {
      id: detailUrl,
      title: videoCode,
      mediaType: "movie",
      posterUrl: cover,
      backdropUrl: cover,
      description: "番号: " + videoCode + "\n播放页被风控，未解析到 m3u8",
      videoUrl: ""
    };
  }

  var docId = Widget.dom.parse(html);
  try {
    var title = metaContent(docId, "og:title") || firstText(docId, "h1") || "";
    if (!title) {
      title = firstText(docId, "title").replace(/\s*-\s*MissAV.*$/i, "").trim();
    }
    if (!title) title = videoCode;

    var description = metaContent(docId, "og:description") || "";
    description = String(description || "").replace(/\s+/g, " ").trim() || title;

    var duration = Number(metaContent(docId, "og:video:duration")) || 0;
    var releaseDate = "";
    var timeNodes = Widget.dom.select(docId, "time") || [];
    if (timeNodes.length) {
      releaseDate = String(
        Widget.dom.attr(timeNodes[0], "datetime") || Widget.dom.text(timeNodes[0]) || ""
      ).trim();
    }

    var genres = parseMissavGenres(html);
    var people = parseMissavPeople(html);
    var cast = (people.actresses || []).map(function (a) {
      return { id: a.id, name: a.name };
    });
    var directors = (people.directors || []).map(function (d) {
      return { id: d.id, name: d.name };
    });

    var resolved = await resolveVideoUrlWithFallback(html, detailUrl, docId);

    var detail = {
      id: detailUrl,
      title: title,
      mediaType: "movie",
      posterUrl: cover,
      backdropUrl: cover,
      description: description,
      duration: duration,
      tags: genres,
      credits: {
        cast: cast,
        directors: directors
      }
    };
    if (releaseDate) detail.releaseDate = releaseDate;
    if (resolved.playSources && resolved.playSources.length) {
      detail.playSources = resolved.playSources;
      detail.videoUrl = resolved.playSources[0].videoUrl;
    } else if (resolved.videoUrl) {
      detail.videoUrl = resolved.videoUrl;
    } else {
      detail.videoUrl = "";
      detail.description = description + "\n未解析到可播放地址";
    }
    return detail;
  } finally {
    Widget.dom.remove(docId);
  }
}
