/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-11-23 13:15:16
 * @LastEditTime: 2021-11-25 00:24:49
 */

const { initWindow, getStreetLinks, getItemsFromStreet, getCommunityDetails, getDetailsFromHouse, getTotalPage, getHousesFromOnePage, getCommunitiesFromOnePage, getHouseDetails } = require('./src/puppeteer.js');
const { insertHouses, insertCommunities, emptyTable, getCommunitiesByStreet, updateDetailsForCommunity, getHousesByStreet, updateDetailsForHouse } = require('./src/mysql');

const HOUSE = 'https://wh.lianjia.com/ershoufang/';
const COMMUNITY = 'https://wh.lianjia.com/xiaoqu/';

const getItems = async (homepage, pupFn, sqlFn, startStreet) => {
  // 启动浏览器
  const { page, browser } = await initWindow();

  // 清空数据表(测试用)
  // await emptyTable('wh_2021');
  
  // 获取街道链接
  const streetLinks = await getStreetLinks(page, homepage);
  console.log(streetLinks.length);

  let flag = !startStreet;

  // 从单个街道链接中获取房屋信息
  for (const street of streetLinks) {
    // 跳过已爬取的部分
    if (!flag) {
      if (street.district !== startStreet) continue;
      flag = true;
    }

    const totalPage = await getTotalPage(page, street);
    for (let i = 1; i <= totalPage; i++) {
      const curItems = await pupFn(page, street, i);
      console.log(curItems.length);

      // 插入数据库
      // sqlFn(curItems);
      break;
    }
    break;
  }

  console.log('任务结束');
  browser.close();
}

const getHouses = () => {
  return getItems(HOUSE, getHousesFromOnePage, insertHouses);
}

const getCommunities = () => {
  return getItems(COMMUNITY, getCommunitiesFromOnePage, insertCommunities);
}

/**
 * 
 * @param {*} getSql 获取待更新项函数
 * @param {*} updateSql 更新函数
 * @param {*} pupFn 爬虫函数
 * @param {*} checkProp 校验该项是否完成
 */
const fillItems = async (homepage, getSql, updateSql, pupFn, checkProp) => {
  const {page, browser} = await initWindow(true);

  const streets = await getStreetLinks(page, homepage);
  // 按街道遍历
  for (const street of streets) {
    console.log(`正在更新 ${street.name} 街道`);
    const items = await getSql(street.name);
    console.log(`共有 ${items.length} 个待更新项`);

    // 遍历小区
    for (const item of items) {
      if (item[checkProp]) continue;

      try {
        const details = await pupFn(page, item);
        // console.log(details);
        await updateSql(item, details);
        console.log(`记录 ${item.name} 更新成功`);
      } catch(err) {
        console.error(`记录 ${item.name} 更新出错`);
        console.log(err);
        continue;
      }
      // break;
    }

    console.log(`街道 ${street.name} 更新成功`);
    // break;
  }

  console.log("任务完成");
  browser.close();
}

const fillCommunities = () => {
  return fillItems(COMMUNITY, getCommunitiesByStreet, updateDetailsForCommunity, getCommunityDetails, "longitude");
}

const fillHouses = () => {
  return fillItems(HOUSE, getHousesByStreet, updateDetailsForHouse, getHouseDetails, "houseUsage");
}

fillCommunities();
// fillHouses();
// getHouses();
// getCommunities();
