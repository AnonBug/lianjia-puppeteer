/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-11-23 13:15:16
 * @LastEditTime: 2021-11-24 12:35:05
 */

const { initWindow, getStreetLinks, getItemsFromStreet } = require('./src/puppeteer.js');
const { emptyTable } = require('./src/mysql');

const ershoufang = 'https://wh.lianjia.com/ershoufang/';
const xiaoqu = 'https://wh.lianjia.com/xiaoqu/';
let flag = false;

const getHouses = async () => {
  // 启动浏览器
  const { page, browser } = await initWindow();

  // 清空数据表(测试用)
  // await emptyTable('wh_2021');
  
  // 获取街道链接
  const streetLinks = await getStreetLinks(page, ershoufang);
  console.log(streetLinks.length);

  // return;

  // 从单个街道链接中获取房屋信息
  for (let street of streetLinks) {
    if (false) {
      if (street.district !== "江汉" || street.name !== "杨汊湖") {
        continue;
      }

      flag = true;
    }
    // 获取房屋信息
    await getItemsFromStreet(page, street, 'house');

    // TEST
    // break;
  }

  console.log('任务结束');
  browser.close();
}

const getCommunities = async () => {
  // 启动浏览器
  const { page, browser } = await initWindow();

  // 清空数据表(测试用)
  // await emptyTable('wh_2021');
  
  // 获取街道链接
  const streetLinks = await getStreetLinks(page, xiaoqu);
  console.log(streetLinks.length);

  // 从单个街道链接中获取房屋信息
  for (let street of streetLinks) {
    if (false) {
      if (street.district !== "江汉" || street.name !== "杨汊湖") {
        continue;
      }

      flag = true;
    }
    // 获取房屋信息
    await getItemsFromStreet(page, street, 'community');

    // TEST
    // break;
  }

  console.log("任务结束");
  browser.close();
}

// getHouses();
getCommunities();
