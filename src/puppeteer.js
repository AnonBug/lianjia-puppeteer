/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-11-23 13:23:08
 * @LastEditTime: 2021-11-24 19:16:18
 */

const puppeteer = require('puppeteer');
const { getLinks, getTotalPage, getHouseInfoFromPage, getCommunityInfoFromPage } = require('./dom');
const { insertHouses, insertCommunities } = require('./mysql');
const { readJson, writeJson, appendArray } = require('./fs');

// 爬取不同类型数据的配置信息
const TYPE = {
  house: {
    selector: 'ul.sellListContent > li',
    sqlFn: insertHouses,
    domFn: getHouseInfoFromPage,
  },
  community: {
    selector: 'ul.listContent > li',
    sqlFn: insertCommunities,
    domFn: getCommunityInfoFromPage,
  },
}

/**
 * 打开窗口
 */
exports.initWindow = () => {
  return new Promise(async (resolve, reject) => {
    // 创建浏览器窗口
    const browser = await puppeteer.launch({
      headless: false, // 有界面模式，可以查看执行详情
      devtools: true,
    });

    // 创建标签页
    const page = await browser.newPage();

    console.log('打开浏览器窗口');
    resolve({ page, browser });
  })
}

/**
 * 获取所有街道链接(含去重)
 * 增加缓存机制: 
 *   - 因为每次服务断开, 都需要重新初始化街道链接, 还挺耗时间的
 *   - 选择用 json 形式存储下来, 链接作为键名, 以支持爬取其它城市或页面
 * @param page 页面操作对象
 * @param cityLink 需要爬取的页面
 * @returns Object[] 返回的信息，同时缓存在 streets.json 里
 *   [{
 *     link: '', // 链接
 *    name: '', // 街道
 *    district: '', // 政区
 *    }, ...]
 */
exports.getStreetLinks = (page, cityLink) => {
  return new Promise(async (resolve, reject) => {
    // 尝试读取缓存
    const storage = await readJson('../json/streets.json');
    if (storage[cityLink]) return resolve(storage[cityLink]);

    // 进入二手房页面
    await page.goto(cityLink);
    // 当页面出现指定元素时，表示已可爬
    await page.waitForSelector('div.position');

    const districts = await page.$$eval('div[data-role=ershoufang]>div>a', getLinks)

    const streetSet = new Set();
    const streetLinks = [];
    for (const district of districts) {
      const { link: dLink, name: dName } = district;

      await page.goto(dLink)
      await page.waitForSelector('div[data-role=ershoufang]');

      // 找二级菜单，继续遍历
      let streets = await page.$$eval('div[data-role=ershoufang] div:last-child a', getLinks);
      for (const street of streets) {
        const { link: sLink, name: sName } = street;

        if (streetSet.has(sName)) continue;

        streetSet.add(sName);
        streetLinks.push({
          link: sLink,
          name: sName,
          district: dName,
        })
      }

      // TEST
      // break;
    }

    // 写入缓存
    await writeJson('../json/streets.json', { ...storage, [cityLink]: streetLinks });

    resolve(streetLinks);
  })
}

/**
 * 从单个街道链接获取所有房屋信息
 * @param {*} page 页面操作对象
 * @param {*} street 街道信息，name/link/district 属性
 * @param {string} type 爬取类型：house/community
 * @returns 
 */
exports.getItemsFromStreet = (page, street, type) => {
  const { selector, domFn, sqlFn } = TYPE[type];

  return new Promise(async (resolve, reject) => {
    console.log(`正在爬取 ${street.district} - ${street.name} 信息`);
    const items = [];

    // 跳到第一页, 获取页数
    await page.goto(street.link);
    const totalPage = await page.$eval('div.house-lst-page-box', getTotalPage);
    console.log(`当前页面共有 ${totalPage} 页`)

    // 通过翻页, 获取所有房子信息
    for (let i = 1; i <= totalPage; i++) {
      console.log(`正在爬取 ${street.name} 第 ${i} 页`);
      
      // 跳转代替翻页
      if (i > 1) {
        await page.goto(`${street.link}pg${i}/`, {
          timeout: 0,
          waitUntil: 'domcontentloaded'
        })
      }
      
      // 从当前页获取信息
      const curPageItems = await page.$$eval(selector, domFn);
      // 添加行政区和街道信息
      curPageItems.forEach(item => {
        item.district = street.district;
        item.street = street.name;
      });

      // 存入数据库
      // await sqlFn(curPageItems);

      items.push(...curPageItems);

      // TEST
      // break;
    }

    // 存入本地文件
    // await appendArray(`../json/${type}.json`, items);

    resolve(items);
  })
}
