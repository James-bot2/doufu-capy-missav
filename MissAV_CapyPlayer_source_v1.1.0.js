// MissAV 源组件（CapyPlayer）v1.1.0
// v1.1.0：播放加 Referer 请求头（顶层 customHeaders + 每条 playSources）+ master 备用线路；
// 分类全量（0922 的 13 组 134 项 + 女优 49 + 发行商 36）；新增“我的收藏”（同步收藏）。
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
  description: "MissAV 视频源：最新更新、今日热门、分类浏览、女优、发行商、搜索、TOP 榜单、我的收藏",
  version: "1.1.0",
  site: "https://missav.ai",
  icon: "https://missav.ai/favicon.ico",
  globalParams: [
    {
      name: "missav_cookie",
      title: "MissAV Cookie（可选）",
      type: "string",
      description: "不填也能用；被风控时可填入浏览器里抓到的 MissAV Cookie",
      value: ""
    },
    {
      name: "missav_sync",
      title: "同步收藏地址（可选）",
      type: "string",
      description: "填 MissAV 同步 Worker 地址（含密钥路径）后，“我的收藏”显示浏览器同步过来的收藏；不填则只显示提示",
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
      id: "uncensored",
      title: "无码影片库",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm817/cn/uncensored-leak",
          enumOptions: [
            { title: "无码流出", value: MISSAV_SITE + "/dm817/cn/uncensored-leak" },
            { title: "FC2", value: MISSAV_SITE + "/dm597/cn/fc2" },
            { title: "HEYZO", value: MISSAV_SITE + "/dm2208642/cn/heyzo" },
            { title: "东京热", value: MISSAV_SITE + "/dm42/cn/tokyohot" },
            { title: "Caribbeancom", value: MISSAV_SITE + "/dm7704788/cn/caribbeancom" },
            { title: "Gachinco", value: MISSAV_SITE + "/dm150/cn/gachinco" },
            { title: "XXX-AV", value: MISSAV_SITE + "/dm42/cn/xxxav" },
            { title: "人妻斩", value: MISSAV_SITE + "/dm37/cn/marriedslash" },
            { title: "顽皮 4610", value: MISSAV_SITE + "/dm33/cn/naughty4610" },
            { title: "顽皮 0930", value: MISSAV_SITE + "/dm37/cn/naughty0930" }
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
      id: "asia",
      title: "亚洲AV专区",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm63/cn/madou",
          enumOptions: [
            { title: "麻豆传媒", value: MISSAV_SITE + "/dm63/cn/madou" },
            { title: "韩国直播", value: MISSAV_SITE + "/cn/klive" },
            { title: "中国直播", value: MISSAV_SITE + "/cn/clive" }
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
      id: "quality",
      title: "影片质量类",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm96/cn/genres/%E9%AB%98%E6%B8%85",
          enumOptions: [
            { title: "高清", value: MISSAV_SITE + "/dm96/cn/genres/%E9%AB%98%E6%B8%85" },
            { title: "独家", value: MISSAV_SITE + "/dm142/cn/genres/%E7%8B%AC%E5%AE%B6" },
            { title: "单体作品", value: MISSAV_SITE + "/dm122/cn/genres/%E5%8D%95%E4%BD%93%E4%BD%9C%E5%93%81" },
            { title: "薄格", value: MISSAV_SITE + "/dm77/cn/genres/%E8%96%84%E6%A0%BC" },
            { title: "全高清 (FHD)", value: MISSAV_SITE + "/cn/genres/%E5%85%A8%E9%AB%98%E6%B8%85%20(FHD)" },
            { title: "低成本影片", value: MISSAV_SITE + "/cn/genres/%E4%BD%8E%E6%88%90%E6%9C%AC%E5%BD%B1%E7%89%87" },
            { title: "套装商品", value: MISSAV_SITE + "/cn/genres/%E5%A5%97%E8%A3%85%E5%95%86%E5%93%81" },
            { title: "限时特卖", value: MISSAV_SITE + "/cn/genres/%E9%99%90%E6%97%B6%E7%89%B9%E5%8D%96" },
            { title: "高清 (HD)", value: MISSAV_SITE + "/cn/genres/%E9%AB%98%E6%B8%85%20%28HD%29" },
            { title: "协力作品", value: MISSAV_SITE + "/cn/genres/%E5%8D%8F%E5%8A%9B%E4%BD%9C%E5%93%81" },
            { title: "单一作品", value: MISSAV_SITE + "/cn/genres/%E5%8D%95%E4%B8%80%E4%BD%9C%E5%93%81" },
            { title: "仅限分发", value: MISSAV_SITE + "/cn/genres/%E4%BB%85%E9%99%90%E5%88%86%E5%8F%91" }
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
      id: "roles",
      title: "角色与身份",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm81/cn/genres/%E4%BA%BA%E5%A6%BB",
          enumOptions: [
            { title: "人妻", value: MISSAV_SITE + "/dm81/cn/genres/%E4%BA%BA%E5%A6%BB" },
            { title: "熟女", value: MISSAV_SITE + "/dm124/cn/genres/%E7%86%9F%E5%A5%B3" },
            { title: "素人", value: MISSAV_SITE + "/dm151/cn/genres/%E7%B4%A0%E4%BA%BA" },
            { title: "美少女", value: MISSAV_SITE + "/dm437/cn/genres/%E7%BE%8E%E5%B0%91%E5%A5%B3" },
            { title: "痴女", value: MISSAV_SITE + "/dm334/cn/genres/%E7%97%B4%E5%A5%B3" },
            { title: "女高中生", value: MISSAV_SITE + "/dm4466/cn/genres/%E5%A5%B3%E9%AB%98%E4%B8%AD%E7%94%9F" },
            { title: "秘书", value: MISSAV_SITE + "/dm63/cn/genres/秘书" },
            { title: "美丽的成熟女人", value: MISSAV_SITE + "/cn/genres/美丽的成熟女人" },
            { title: "妈妈朋友", value: MISSAV_SITE + "/dm12/cn/genres/%E5%A6%88%E5%A6%88%E6%9C%8B%E5%8F%8B" },
            { title: "M女人", value: MISSAV_SITE + "/dm2/cn/genres/M%E5%A5%B3%E4%BA%BA" },
            { title: "成熟的女人", value: MISSAV_SITE + "/cn/genres/%E6%88%90%E7%86%9F%E7%9A%84%E5%A5%B3%E4%BA%BA" },
            { title: "家庭主妇", value: MISSAV_SITE + "/cn/genres/%E5%AE%B6%E5%BA%AD%E4%B8%BB%E5%A6%87" },
            { title: "成熟女人 / 已婚女人", value: MISSAV_SITE + "/dm3/cn/genres/%E6%88%90%E7%86%9F%E5%A5%B3%E4%BA%BA%20/%20%E5%B7%B2%E5%A9%9A%E5%A5%B3%E4%BA%BA" },
            { title: "其他学生", value: MISSAV_SITE + "/dm1/cn/genres/%E5%85%B6%E4%BB%96%E5%AD%A6%E7%94%9F" },
            { title: "大小姐", value: MISSAV_SITE + "/dm78/cn/genres/%E5%A4%A7%E5%B0%8F%E5%A7%90" },
            { title: "公主", value: MISSAV_SITE + "/cn/genres/%E5%85%AC%E4%B8%BB" },
            { title: "美丽的女孩", value: MISSAV_SITE + "/dm89/cn/genres/%E7%BE%8E%E4%B8%BD%E7%9A%84%E5%A5%B3%E5%AD%A9" },
            { title: "新娘 / 年轻的妻子", value: MISSAV_SITE + "/cn/genres/%E6%96%B0%E5%A8%98%20/%20%E5%B9%B4%E8%BD%BB%E7%9A%84%E5%A6%BB%E5%AD%90" },
            { title: "养女", value: MISSAV_SITE + "/dm4/cn/genres/%E5%85%BB%E5%A5%B3" }
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
      id: "acts",
      title: "性行为类型",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm133/cn/genres/%E4%B8%AD%E5%87%BA",
          enumOptions: [
            { title: "中出", value: MISSAV_SITE + "/dm133/cn/genres/%E4%B8%AD%E5%87%BA" },
            { title: "口交", value: MISSAV_SITE + "/dm1303/cn/genres/%E5%8F%A3%E4%BA%A4" },
            { title: "骑乘", value: MISSAV_SITE + "/dm490/cn/genres/%E9%AA%91%E4%B9%98" },
            { title: "潮吹", value: MISSAV_SITE + "/dm166/cn/genres/%E6%BD%AE%E5%90%B9" },
            { title: "乳交", value: MISSAV_SITE + "/dm599/cn/genres/%E4%B9%B3%E4%BA%A4" },
            { title: "颜射", value: MISSAV_SITE + "/dm321/cn/genres/%E9%A2%9C%E5%B0%84" },
            { title: "自慰", value: MISSAV_SITE + "/dm8546/cn/genres/%E8%87%AA%E6%85%B0" },
            { title: "手淫", value: MISSAV_SITE + "/dm95/cn/genres/%E6%89%8B%E6%B7%AB" },
            { title: "内射精", value: MISSAV_SITE + "/dm77/cn/genres/%E5%86%85%E5%B0%84%E7%B2%BE" },
            { title: "极致高潮", value: MISSAV_SITE + "/dm26/cn/genres/%E6%9E%81%E8%87%B4%E9%AB%98%E6%BD%AE" },
            { title: "3P", value: MISSAV_SITE + "/dm45/cn/genres/3P" },
            { title: "多人", value: MISSAV_SITE + "/cn/genres/%E5%A4%9A%E4%BA%BA" },
            { title: "狗狗式", value: MISSAV_SITE + "/cn/genres/%E7%8B%97%E7%8B%97%E5%BC%8F" },
            { title: "撒尿", value: MISSAV_SITE + "/cn/genres/%E6%92%92%E5%B0%BF" },
            { title: "盐吹", value: MISSAV_SITE + "/cn/genres/%E7%9B%90%E5%90%B9" },
            { title: "3P / 4P", value: MISSAV_SITE + "/cn/genres/3P%20/%204P" },
            { title: "洗澡", value: MISSAV_SITE + "/cn/genres/%E6%B4%97%E6%BE%A1" }
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
      id: "plots",
      title: "情节与主题",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm349/cn/genres/%E4%BC%81%E5%88%92",
          enumOptions: [
            { title: "企划", value: MISSAV_SITE + "/dm349/cn/genres/%E4%BC%81%E5%88%92" },
            { title: "乱伦", value: MISSAV_SITE + "/dm58/cn/genres/%E4%B9%B1%E4%BC%A6" },
            { title: "NTR", value: MISSAV_SITE + "/dm772/cn/genres/NTR" },
            { title: "搭讪", value: MISSAV_SITE + "/dm370/cn/genres/%E6%90%AD%E8%AE%AA" },
            { title: "淫乱", value: MISSAV_SITE + "/dm906/cn/genres/%E6%B7%AB%E4%B9%B1" },
            { title: "剧情", value: MISSAV_SITE + "/dm106/cn/genres/%E5%89%A7%E6%83%85" },
            { title: "羞辱", value: MISSAV_SITE + "/dm162/cn/genres/%E7%BE%9E%E8%BE%B1" },
            { title: "妻子的出轨 / NTR / 戴绿帽子", value: MISSAV_SITE + "/cn/genres/%E5%A6%BB%E5%AD%90%E7%9A%84%E5%87%BA%E8%BD%A8%20/%20NTR%20/%20%E6%88%B4%E7%BB%BF%E5%B8%BD%E5%AD%90" },
            { title: "戴绿帽子", value: MISSAV_SITE + "/dm23/cn/genres/%E6%88%B4%E7%BB%BF%E5%B8%BD%E5%AD%90" },
            { title: "告白体验", value: MISSAV_SITE + "/cn/genres/%E5%91%8A%E7%99%BD%E4%BD%93%E9%AA%8C" },
            { title: "外遇妻子 / NTR / 戴绿帽子", value: MISSAV_SITE + "/cn/genres/%E5%A4%96%E9%81%87%E5%A6%BB%E5%AD%90%20/%20NTR%20/%20%E6%88%B4%E7%BB%BF%E5%B8%BD%E5%AD%90" },
            { title: "交往", value: MISSAV_SITE + "/cn/genres/%E4%BA%A4%E5%BE%80" }
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
      id: "kinks",
      title: "特殊玩法类",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm321/cn/genres/%E5%A4%9A%E4%BA%BA%E8%BF%90%E5%8A%A8",
          enumOptions: [
            { title: "多人运动", value: MISSAV_SITE + "/dm321/cn/genres/%E5%A4%9A%E4%BA%BA%E8%BF%90%E5%8A%A8" },
            { title: "拘束", value: MISSAV_SITE + "/dm154/cn/genres/%E6%8B%98%E6%9D%9F" },
            { title: "脏话", value: MISSAV_SITE + "/cn/genres/%E8%84%8F%E8%AF%9D" },
            { title: "催眠洗脑", value: MISSAV_SITE + "/cn/genres/%E5%82%AC%E7%9C%A0%E6%B4%97%E8%84%91" },
            { title: "口球", value: MISSAV_SITE + "/cn/genres/%E5%8F%A3%E7%90%83" },
            { title: "放置Play", value: MISSAV_SITE + "/cn/genres/%E6%94%BE%E7%BD%AEPlay" },
            { title: "奴隶", value: MISSAV_SITE + "/dm6/cn/genres/%E5%A5%B4%E9%9A%B6" }
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
      id: "body",
      title: "身材特征类",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm156/cn/genres/%E5%B7%A8%E4%B9%B3",
          enumOptions: [
            { title: "巨乳", value: MISSAV_SITE + "/dm156/cn/genres/%E5%B7%A8%E4%B9%B3" },
            { title: "苗条", value: MISSAV_SITE + "/dm757/cn/genres/%E8%8B%97%E6%9D%A1" },
            { title: "美乳", value: MISSAV_SITE + "/dm218/cn/genres/%E7%BE%8E%E4%B9%B3" },
            { title: "D罩杯", value: MISSAV_SITE + "/cn/genres/D%E7%BD%A9%E6%9D%AF" },
            { title: "背部", value: MISSAV_SITE + "/dm429/cn/genres/%E8%83%8C%E9%83%A8" },
            { title: "美丽的屁股", value: MISSAV_SITE + "/cn/genres/%E7%BE%8E%E4%B8%BD%E7%9A%84%E5%B1%81%E8%82%A1" },
            { title: "E罩杯以上的Judai（青少年）", value: MISSAV_SITE + "/cn/genres/E%E7%BD%A9%E6%9D%AF%E4%BB%A5%E4%B8%8A%E7%9A%84Judai%EF%BC%88%E9%9D%92%E5%B0%91%E5%B9%B4%EF%BC%89" },
            { title: "甜屁股", value: MISSAV_SITE + "/dm1/cn/genres/%E7%94%9C%E5%B1%81%E8%82%A1" },
            { title: "美尻", value: MISSAV_SITE + "/cn/genres/%E7%BE%8E%E5%B0%BB" },
            { title: "性感的腿", value: MISSAV_SITE + "/cn/genres/%E6%80%A7%E6%84%9F%E7%9A%84%E8%85%BF" },
            { title: "大乳房", value: MISSAV_SITE + "/dm2/cn/genres/%E5%A4%A7%E4%B9%B3%E6%88%BF" },
            { title: "白皙的皮肤", value: MISSAV_SITE + "/cn/genres/%E7%99%BD%E7%9A%99%E7%9A%84%E7%9A%AE%E8%82%A4" },
            { title: "小乳房", value: MISSAV_SITE + "/cn/genres/%E5%B0%8F%E4%B9%B3%E6%88%BF" },
            { title: "皮肤黑", value: MISSAV_SITE + "/cn/genres/%E7%9A%AE%E8%82%A4%E9%BB%91" }
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
      id: "jobs",
      title: "职业角色类",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/cn/genres/%E6%8E%A5%E5%BE%85%E5%91%98",
          enumOptions: [
            { title: "接待员", value: MISSAV_SITE + "/cn/genres/%E6%8E%A5%E5%BE%85%E5%91%98" },
            { title: "女导游", value: MISSAV_SITE + "/dm143/cn/genres/%E5%A5%B3%E5%AF%BC%E6%B8%B8" },
            { title: "啦啦队", value: MISSAV_SITE + "/cn/genres/%E5%95%A6%E5%95%A6%E9%98%9F" },
            { title: "空中小姐 CA", value: MISSAV_SITE + "/dm3/cn/genres/%E7%A9%BA%E4%B8%AD%E5%B0%8F%E5%A7%90%20CA" },
            { title: "台湾模特儿", value: MISSAV_SITE + "/cn/genres/%E5%8F%B0%E6%B9%BE%E6%A8%A1%E7%89%B9%E5%84%BF" },
            { title: "迷你裙女警", value: MISSAV_SITE + "/dm1/cn/genres/%E8%BF%B7%E4%BD%A0%E8%A3%99%E5%A5%B3%E8%AD%A6" },
            { title: "色情明星", value: MISSAV_SITE + "/cn/genres/%E8%89%B2%E6%83%85%E6%98%8E%E6%98%9F" },
            { title: "演员", value: MISSAV_SITE + "/cn/genres/%E6%BC%94%E5%91%98" }
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
      id: "shooting",
      title: "拍摄方式类",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm978/cn/genres/%E8%87%AA%E6%8B%8D",
          enumOptions: [
            { title: "自拍", value: MISSAV_SITE + "/dm978/cn/genres/%E8%87%AA%E6%8B%8D" },
            { title: "偷拍", value: MISSAV_SITE + "/dm532/cn/genres/%E5%81%B7%E6%8B%8D" },
            { title: "第一次拍摄", value: MISSAV_SITE + "/dm2/cn/genres/%E7%AC%AC%E4%B8%80%E6%AC%A1%E6%8B%8D%E6%91%84" },
            { title: "主观性", value: MISSAV_SITE + "/cn/genres/%E4%B8%BB%E8%A7%82%E6%80%A7" },
            { title: "记录", value: MISSAV_SITE + "/cn/genres/%E8%AE%B0%E5%BD%95" },
            { title: "按摩", value: MISSAV_SITE + "/dm163/cn/genres/%E6%8C%89%E6%91%A9" }
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
      id: "duration",
      title: "时长合集类",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm755/cn/genres/4%E5%B0%8F%E6%97%B6%E4%BB%A5%E4%B8%8A",
          enumOptions: [
            { title: "4小时以上", value: MISSAV_SITE + "/dm755/cn/genres/4%E5%B0%8F%E6%97%B6%E4%BB%A5%E4%B8%8A" },
            { title: "合集", value: MISSAV_SITE + "/dm796/cn/genres/%E5%90%88%E9%9B%86" },
            { title: "超过工作时间 4 小时", value: MISSAV_SITE + "/cn/genres/%E8%B6%85%E8%BF%87%E5%B7%A5%E4%BD%9C%E6%97%B6%E9%97%B4%204%20%E5%B0%8F%E6%97%B6" }
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
      id: "outfit",
      title: "服装造型类",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/cn/genres/%E8%A3%99%E5%AD%90%E5%8D%95%E5%A3%B0%E9%81%93",
          enumOptions: [
            { title: "裙子单声道", value: MISSAV_SITE + "/cn/genres/%E8%A3%99%E5%AD%90%E5%8D%95%E5%A3%B0%E9%81%93" },
            { title: "浴衣", value: MISSAV_SITE + "/dm1/cn/genres/%E6%B5%B4%E8%A1%A3" },
            { title: "中长发", value: MISSAV_SITE + "/dm1/cn/genres/%E4%B8%AD%E9%95%BF%E5%8F%91" },
            { title: "连裤袜的事", value: MISSAV_SITE + "/cn/genres/%E8%BF%9E%E8%A3%A4%E8%A2%9C%E7%9A%84%E4%BA%8B" },
            { title: "面具", value: MISSAV_SITE + "/dm2/cn/genres/%E9%9D%A2%E5%85%B7" },
            { title: "靴子", value: MISSAV_SITE + "/cn/genres/%E9%9D%B4%E5%AD%90" },
            { title: "卷发", value: MISSAV_SITE + "/cn/genres/%E5%8D%B7%E5%8F%91" },
            { title: "高跟鞋", value: MISSAV_SITE + "/cn/genres/%E9%AB%98%E8%B7%9F%E9%9E%8B" },
            { title: "围裙", value: MISSAV_SITE + "/dm25/cn/genres/%E5%9B%B4%E8%A3%99" },
            { title: "金发", value: MISSAV_SITE + "/cn/genres/%E9%87%91%E5%8F%91" },
            { title: "啡发", value: MISSAV_SITE + "/cn/genres/%E5%95%A1%E5%8F%91" }
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
      id: "themes",
      title: "特殊题材类",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择分类", type: "enum",
          value: MISSAV_SITE + "/dm1/cn/genres/SF",
          enumOptions: [
            { title: "SF", value: MISSAV_SITE + "/dm1/cn/genres/SF" },
            { title: "洛丽塔", value: MISSAV_SITE + "/cn/genres/%E6%B4%9B%E4%B8%BD%E5%A1%94" },
            { title: "御宅", value: MISSAV_SITE + "/dm1/cn/genres/%E5%BE%A1%E5%AE%85" },
            { title: "魔法少女", value: MISSAV_SITE + "/cn/genres/%E9%AD%94%E6%B3%95%E5%B0%91%E5%A5%B3" },
            { title: "游戏现实版", value: MISSAV_SITE + "/cn/genres/%E6%B8%B8%E6%88%8F%E7%8E%B0%E5%AE%9E%E7%89%88" },
            { title: "3D", value: MISSAV_SITE + "/dm24/cn/genres/3D" },
            { title: "AI生成的作品", value: MISSAV_SITE + "/cn/genres/AI%E7%94%9F%E6%88%90%E7%9A%84%E4%BD%9C%E5%93%81" },
            { title: "动漫人物", value: MISSAV_SITE + "/cn/genres/%E5%8A%A8%E6%BC%AB%E4%BA%BA%E7%89%A9" },
            { title: "虚拟现实", value: MISSAV_SITE + "/cn/genres/%E8%99%9A%E6%8B%9F%E7%8E%B0%E5%AE%9E" },
            { title: "动画", value: MISSAV_SITE + "/cn/genres/%E5%8A%A8%E7%94%BB" },
            { title: "偶像", value: MISSAV_SITE + "/dm1/cn/genres/%E5%81%B6%E5%83%8F" },
            { title: "透过偶像", value: MISSAV_SITE + "/cn/genres/%E9%80%8F%E8%BF%87%E5%81%B6%E5%83%8F" }
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
      id: "actresses",
      title: "女优",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择女优", type: "enum",
          value: MISSAV_SITE + "/dm179/cn/actresses/%E7%80%AC%E6%88%B8%E7%92%B0%E5%A5%88",
          enumOptions: [
            { title: "瀬户环奈", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%80%AC%E6%88%B8%E7%92%B0%E5%A5%88" },
            { title: "逢泽みゆ", value: MISSAV_SITE + "/dm179/cn/actresses/%E9%80%A2%E6%B2%A2%E3%81%BF%E3%82%86" },
            { title: "河北彩花", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%B2%B3%E5%8C%97%E5%BD%A9%E8%8A%B1" },
            { title: "松本一香", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%9D%BE%E6%9C%AC%E4%B8%80%E9%A6%99" },
            { title: "美园和花", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%BE%8E%E5%9B%AD%E5%92%8C%E8%8A%B1" },
            { title: "北冈果林", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%8C%97%E5%B2%A1%E6%9E%9C%E6%9E%97" },
            { title: "柏木こなつ", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%9F%8F%E6%9C%A8%E3%81%93%E3%81%AA%E3%81%A4" },
            { title: "浅野こころ", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%B5%85%E9%87%8E%E3%81%93%E3%81%93%E3%82%8D" },
            { title: "北野未奈", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%8C%97%E9%87%8E%E6%9C%AA%E5%A5%88" },
            { title: "清原みゆう", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%B8%85%E5%8E%9F%E3%81%BF%E3%82%86%E3%81%86" },
            { title: "沙月惠奈", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%B2%99%E6%9C%88%E6%83%A0%E5%A5%88" },
            { title: "miru", value: MISSAV_SITE + "/dm179/cn/actresses/miru" },
            { title: "七森莉莉", value: MISSAV_SITE + "/dm179/cn/actresses/%E4%B8%83%E6%A3%AE%E8%8E%89%E8%8E%89" },
            { title: "七濑爱丽丝", value: MISSAV_SITE + "/dm179/cn/actresses/%E4%B8%83%E6%BF%91%E7%88%B1%E4%B8%BD%E4%B8%9D" },
            { title: "鹫尾芽衣", value: MISSAV_SITE + "/dm179/cn/actresses/%E9%B9%AB%E5%B0%BE%E8%8A%BD%E8%A1%A3" },
            { title: "博多彩叶", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%8D%9A%E5%A4%9A%E5%BD%A9%E5%8F%B6" },
            { title: "石川澪", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%9F%B3%E5%B7%9D%E6%BE%AA" },
            { title: "白上咲花", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%99%BD%E4%B8%8A%E5%92%B2%E8%8A%B1" },
            { title: "田野忧", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%94%B0%E9%87%8E%E5%BF%A7" },
            { title: "未步なな", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%9C%AA%E6%AD%A5%E3%81%AA%E3%81%AA" },
            { title: "村上悠华", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%9D%91%E4%B8%8A%E6%82%A0%E5%8D%8E" },
            { title: "三田真铃", value: MISSAV_SITE + "/dm179/cn/actresses/%E4%B8%89%E7%94%B0%E7%9C%9F%E9%93%83" },
            { title: "八挂うみ", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%85%AB%E6%8E%9B%E3%81%86%E3%81%BF" },
            { title: "初美なのか", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%88%9D%E7%BE%8E%E3%81%AA%E3%81%AE%E3%81%8B" },
            { title: "宫下玲奈", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%AE%AE%E4%B8%8B%E7%8E%B2%E5%A5%88" },
            { title: "新有菜", value: MISSAV_SITE + "/dm58/actresses/%E6%A9%8B%E6%9C%AC%E6%9C%89%E8%8F%9C%20%28%E6%96%B0%E6%9C%89%E8%8F%9C%29" },
            { title: "新木希空", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%96%B0%E6%9C%A8%E5%B8%8C%E7%A9%BA" },
            { title: "明里つむぎ", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%98%8E%E9%87%8C%E3%81%A4%E3%82%80%E3%81%8E" },
            { title: "小野六花", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%B0%8F%E9%87%8E%E5%85%AD%E8%8A%B1" },
            { title: "宇都宫紫苑", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%AE%87%E9%83%BD%E5%AE%AE%E7%B4%AB%E8%8B%91" },
            { title: "小宵こなん", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%B0%8F%E5%AE%B5%E3%81%93%E3%81%AA%E3%82%93" },
            { title: "本庄鈴", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%9C%AC%E5%BA%84%E9%88%B4" },
            { title: "桃乃木かな", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%A1%83%E4%B9%83%E6%9C%A8%E3%81%8B%E3%81%AA" },
            { title: "桜空もも", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%A1%9C%E7%A9%BA%E3%82%82%E3%82%82" },
            { title: "楓ふうあ", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%A1%AB%E3%81%B5%E3%81%86%E3%81%82" },
            { title: "楓カレン", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%A5%93%E3%82%AB%E3%83%AC%E3%83%B3" },
            { title: "涼森れむ", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%B6%BC%E6%A3%AE%E3%82%8C%E3%82%80" },
            { title: "瀧本雫葉", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%80%A7%E6%9C%AC%E9%9B%AB%E8%91%89" },
            { title: "田中レモン", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%94%B0%E4%B8%AD%E3%83%AC%E3%83%A2%E3%83%B3" },
            { title: "相沢みなみ", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%9B%B8%E6%B2%A2%E3%81%BF%E3%81%AA%E3%81%BF" },
            { title: "神木麗", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%A5%9E%E6%9C%A8%E9%BA%97" },
            { title: "美ノ嶋めぐり", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%BE%8E%E3%83%8E%E5%B6%8B%E3%82%81%E3%81%90%E3%82%8A" },
            { title: "野々浦暖", value: MISSAV_SITE + "/dm179/cn/actresses/%E9%87%8E%E3%80%85%E6%B5%A6%E6%9A%96" },
            { title: "青空ひかり", value: MISSAV_SITE + "/dm179/cn/actresses/%E9%9D%92%E7%A9%BA%E3%81%B2%E3%81%8B%E3%82%8A" },
            { title: "三上悠亚", value: MISSAV_SITE + "/dm179/cn/actresses/%E4%B8%89%E4%B8%8A%E6%82%A0%E4%BA%9A" },
            { title: "榊原萌", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%A6%8A%E5%8E%9F%E8%90%8C" },
            { title: "彩月七绪", value: MISSAV_SITE + "/dm179/cn/actresses/%E5%BD%A9%E6%9C%88%E4%B8%83%E7%BB%AA" },
            { title: "神宫寺奈绪", value: MISSAV_SITE + "/dm179/cn/actresses/%E7%A5%9E%E5%AE%AB%E5%AF%BA%E5%A5%88%E7%BB%AA" },
            { title: "有村のぞみ", value: MISSAV_SITE + "/dm179/cn/actresses/%E6%9C%89%E6%9D%91%E3%81%AE%E3%81%9E%E3%81%BF" }
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
      id: "makers",
      title: "发行商",
      type: "media_list",
      functionName: "getGenreVideos",
      cacheDuration: 1800,
      params: [
        {
          name: "url", title: "选择发行商", type: "enum",
          value: MISSAV_SITE + "/dm825/cn/makers/Moody%27s",
          enumOptions: [
            { title: "Moody's", value: MISSAV_SITE + "/dm825/cn/makers/Moody%27s" },
            { title: "Prestige", value: MISSAV_SITE + "/dm825/cn/makers/Prestige" },
            { title: "Madonna", value: MISSAV_SITE + "/dm825/cn/makers/Madonna" },
            { title: "S1", value: MISSAV_SITE + "/dm825/cn/makers/S1" },
            { title: "SOD", value: MISSAV_SITE + "/dm825/cn/makers/SOD" },
            { title: "IdeaPocket", value: MISSAV_SITE + "/dm825/cn/makers/IdeaPocket" },
            { title: "Attackers", value: MISSAV_SITE + "/dm825/cn/makers/Attackers" },
            { title: "Glory Quest", value: MISSAV_SITE + "/dm825/cn/makers/Glory%20Quest" },
            { title: "ビッグモーカル", value: MISSAV_SITE + "/dm825/cn/makers/%E3%83%93%E3%83%83%E3%82%B0%E3%83%A2%E3%83%BC%E3%82%AB%E3%83%AB" },
            { title: "NATURAL HIGH", value: MISSAV_SITE + "/dm825/cn/makers/NATURAL%20HIGH" },
            { title: "Wanz Factory", value: MISSAV_SITE + "/dm825/cn/makers/Wanz%20Factory" },
            { title: "Takara Visual", value: MISSAV_SITE + "/dm825/cn/makers/Takara%20Visual" },
            { title: "Fc2", value: MISSAV_SITE + "/dm825/cn/makers/Fc2" },
            { title: "Premium", value: MISSAV_SITE + "/dm825/cn/makers/Premium" },
            { title: "Fitch", value: MISSAV_SITE + "/dm825/cn/makers/Fitch" },
            { title: "VENUS", value: MISSAV_SITE + "/dm825/cn/makers/VENUS" },
            { title: "DEEP'S", value: MISSAV_SITE + "/dm825/cn/makers/DEEP%27S" },
            { title: "本中", value: MISSAV_SITE + "/dm825/cn/makers/%E6%9C%AC%E4%B8%AD" },
            { title: "Hunter", value: MISSAV_SITE + "/dm825/cn/makers/Hunter" },
            { title: "溜池ゴロー", value: MISSAV_SITE + "/dm825/cn/makers/%E6%BA%9C%E6%B1%A0%E3%82%B4%E3%83%AD%E3%83%BC" },
            { title: "TMA", value: MISSAV_SITE + "/dm825/cn/makers/TMA" },
            { title: "センタービレッジ", value: MISSAV_SITE + "/dm825/cn/makers/%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%93%E3%83%AC%E3%83%83%E3%82%B8" },
            { title: "Das", value: MISSAV_SITE + "/dm825/cn/makers/Das" },
            { title: "Waap Entertainment", value: MISSAV_SITE + "/dm825/cn/makers/Waap%20Entertainment" },
            { title: "Crystal-Eizou", value: MISSAV_SITE + "/dm825/cn/makers/Crystal-Eizou" },
            { title: "kawaii", value: MISSAV_SITE + "/dm825/cn/makers/kawaii" },
            { title: "ゴーゴーズ", value: MISSAV_SITE + "/dm825/cn/makers/%E3%82%B4%E3%83%BC%E3%82%B4%E3%83%BC%E3%82%BA" },
            { title: "プラネットプラス", value: MISSAV_SITE + "/dm825/cn/makers/%E3%83%97%E3%83%A9%E3%83%8D%E3%83%83%E3%83%88%E3%83%97%E3%83%A9%E3%82%B9" },
            { title: "OPPAI", value: MISSAV_SITE + "/dm825/cn/makers/OPPAI" },
            { title: "STAR PARADISE", value: MISSAV_SITE + "/dm825/cn/makers/STAR%20PARADISE" },
            { title: "E-BODY", value: MISSAV_SITE + "/dm825/cn/makers/E-BODY" },
            { title: "セレブの友", value: MISSAV_SITE + "/dm825/cn/makers/%E3%82%BB%E3%83%AC%E3%83%96%E3%81%AE%E5%8F%8B" },
            { title: "ドグマ", value: MISSAV_SITE + "/dm825/cn/makers/%E3%83%89%E3%82%B0%E3%83%9E" },
            { title: "Alice Japan", value: MISSAV_SITE + "/dm825/cn/makers/Alice%20Japan" },
            { title: "KM Produce", value: MISSAV_SITE + "/dm825/cn/makers/KM%20Produce" },
            { title: "桃太郎映像出版", value: MISSAV_SITE + "/dm825/cn/makers/%E6%A1%83%E5%A4%AA%E9%83%8E%E6%98%A0%E5%83%8F%E5%87%BA%E7%89%88" }
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
    },
    {
      id: "saved",
      title: "我的收藏",
      type: "media_list",
      functionName: "loadSyncedSaved",
      cacheDuration: 600,
      params: []
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
  // 播放请求头（v1.1.0）：surrit 取流要带详情页 Referer。v1.0.0 只在拉 master 清单时带了，
  // 播放器自己拉 variant 清单和分片时没有 Referer，手机上读到时长但 0 B/s 播不出来。
  // 所以每条线路都带一份 customHeaders，顶层 detail 对象上也放一份（见 loadDetail）。
  var playHeaders = getPlayHeaders(detailUrl);
  try {
    var response = await Widget.http.get(playlistUrl, {
      headers: playHeaders
    });
    var masterText = (response && response.data) || "";
    var variants = parseM3u8Variants(masterText, uuid);
    if (variants.length >= 1) {
      var sources = variants.map(function (v, idx) {
        return {
          id: "line-" + (idx + 1),
          title: v.title,
          videoUrl: v.videoUrl,
          isDefault: idx === 0,
          customHeaders: playHeaders
        };
      });
      // master 本身保留为一条备用线路（默认走最高档，master 只作后备）
      sources.push({
        id: "line-master",
        title: "原片源（master）",
        videoUrl: playlistUrl,
        isDefault: false,
        customHeaders: playHeaders
      });
      return {
        videoUrl: variants[0].videoUrl,
        playSources: sources,
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
    // 播放请求头（v1.1.0）：顶层放一份，videoUrl 走顶层头；playSources 每条线路自带一份。
    var playHeaders = getPlayHeaders(detailUrl);

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
      detail.customHeaders = playHeaders;
      detail.headers = playHeaders;
    } else if (resolved.videoUrl) {
      detail.videoUrl = resolved.videoUrl;
      detail.customHeaders = playHeaders;
      detail.headers = playHeaders;
    } else {
      detail.videoUrl = "";
      detail.description = description + "\n未解析到可播放地址";
    }
    return detail;
  } finally {
    Widget.dom.remove(docId);
  }
}

// ---------------- 同步收藏（自 Rex v5.2.2 移植） ----------------
// 认证在用户自己的浏览器里做——已登录的浏览器打开 MissAV 收藏页点同步书签，
// 书签把收藏提炼成精简记录发到同步 Worker 存 KV；这里只取已同步的列表转卡片。
// 同步地址存在全局参数 missav_sync 里（默认空，用户自己填）。

function buildStatusItem(id, title, subTitle) {
  return { id: id, type: "text", title: title, subTitle: subTitle || "" };
}

function extractSyncVideoId(href) {
  if (!href) return "";
  var cleanHref = String(href).split("#")[0].split("?")[0];
  var slug = cleanHref.split("/").pop() || "";
  return slug.replace(/-(uncensored-leak|chinese-subtitle)$/, "").toUpperCase();
}

function normalizeFourhoiHost(url) {
  var raw = String(url || "").trim();
  if (!raw) return raw;
  return raw.replace(/^https:\/\/fourhoi\.com\//i, "https://fourhoi.mrstcdn.store/");
}

function getSyncFourhoiCoverUrl(videoId) {
  if (!videoId) return "";
  return "https://fourhoi.mrstcdn.store/" + String(videoId).toLowerCase() + "/cover-t.jpg";
}

// v3.22 封面修法：posterPath 与 coverUrl 取同一张 fourhoi.mrstcdn.store 横图，绝不用 DMM ps.jpg。
function buildSyncedVideoItem(v) {
  var link = String((v && v.l) || "").trim();
  var title = String((v && v.t) || "").trim();
  if (!link || !title) return null;
  var videoId = extractSyncVideoId(link);
  var durationText = String((v && v.d) || "").trim();
  var imgSrc = normalizeFourhoiHost(String((v && v.c) || "").trim());
  var coverUrl = imgSrc || getSyncFourhoiCoverUrl(videoId);
  return {
    id: link,
    type: "link",
    title: title,
    mediaType: "movie",
    posterUrl: coverUrl,
    backdropUrl: coverUrl,
    posterPath: coverUrl,
    coverUrl: coverUrl,
    link: link,
    description: "时长: " + durationText + (videoId ? " | 番号: " + videoId : ""),
    duration: parseDurationToSeconds(durationText),
    durationText: durationText
  };
}

async function loadSyncedSaved(params) {
  params = params || {};
  var sync = String(params.missav_sync || "").trim().replace(/\/+$/, "");
  if (!sync) {
    return [
      buildStatusItem(
        "missav_sync_no_url",
        "还没填同步地址",
        "先在组件设置里填同步 Worker 地址（含密钥路径），例如 https://missav-sync.xxx/密钥；再去已登录的浏览器里打开 MissAV 收藏页，点同步书签，列表就同步过来"
      )
    ];
  }
  var data = null;
  try {
    var res = await Widget.http.get(sync + "/saved-list", { headers: { "Accept": "application/json" } });
    var d = res && res.data;
    data = typeof d === "string" ? JSON.parse(d) : d;
  } catch (e) {
    return [buildStatusItem("missav_sync_err", "同步列表拉取失败", (e && e.message) || "请求错误，请检查同步地址是否填对、网络是否正常")];
  }
  if (!data || data.ok === false) {
    var msg = (data && data.message) || "还没有同步过收藏";
    return [
      buildStatusItem(
        "missav_sync_empty",
        "还没有同步过收藏",
        msg + "。做法：在已登录的浏览器里打开 MissAV 收藏页（/cn/saved），点同步书签，等它提示“已同步”，再回这里打开"
      )
    ];
  }
  var out = [];
  // v2 精简格式：书签已提炼好的视频列表（标题/链接/封面/时长）
  var videos = Array.isArray(data.videos) ? data.videos : [];
  for (var i = 0; i < videos.length; i++) {
    var item = buildSyncedVideoItem(videos[i]);
    if (item) out.push(item);
  }
  // v1 兼容：旧书签发的整页 HTML，用本组件自带的 parseVideoList 解析
  if (!out.length) {
    var pages = Array.isArray(data.pages) ? data.pages : [];
    for (var j = 0; j < pages.length; j++) {
      var items = parseVideoList(pages[j], params);
      for (var k = 0; k < items.length; k++) {
        if (items[k] && items[k].type !== "text") out.push(items[k]);
      }
    }
  }
  if (!out.length) {
    return [buildStatusItem("missav_sync_empty", "同步的收藏是空的", "同步到的页面里没有解析出视频：可能同步时浏览器没登录，或者收藏本身是空的；重新登录后点一次同步书签再试")];
  }
  var at = data.updated_at ? new Date(data.updated_at) : null;
  if (at) {
    out.unshift(
      buildStatusItem(
        "missav_sync_info",
        "已同步 " + out.length + " 条",
        "同步时间：" + at.getFullYear() + "-" + String(at.getMonth() + 1).padStart(2, "0") + "-" + String(at.getDate()).padStart(2, "0") + " " + String(at.getHours()).padStart(2, "0") + ":" + String(at.getMinutes()).padStart(2, "0") + "；收藏有新增/删除时，去浏览器收藏页再点一次同步书签"
      )
    );
  }
  return out;
}
