/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-11-23 13:26:48
 * @LastEditTime: 2021-11-23 22:14:14
 */

exports.getLinks = eles => eles.map(ele => ({
  link: ele.href,
  name: ele.innerText,
}))

exports.getTotalPage = ele => JSON.parse(ele.getAttribute('page-data')).totalPage;

exports.getHouseInfoFromPage = eles => eles.map(ele => {
  // 房屋 code
  const code = ele.querySelector('a').getAttribute('data-housecode');
  // 房屋链接
  const link = ele.querySelector('a').href;
  // 小区名称
  const name = ele.querySelector('div.positionInfo > a').innerText;
  // 文案描述
  const desc = ele.querySelector('div.title > a').innerText;
  // 详情
  const details = ele.querySelector('div.houseInfo').innerText;
  // const date = ele.querySelector('.dealDate').innerText
  // 总价
  const totalPrice = ele.querySelector('.totalPrice span').innerText;
  // 单价
  const unitPrice = ele.querySelector('.unitPrice').getAttribute('data-price');
  
  const res = {
    // 用不了 es6 语法
    code: code,
    link: link,
    name: name,
    desc: desc,
    details: details,
    totalPrice: totalPrice,
    unitPrice: unitPrice
  }

  return res;
})

/**
 * 获取小区详情
 */
exports.getCommunityInfoFromPage = eles => eles.map(ele => {
  // 小区 code
  const code = ele.getAttribute('data-housecode');
  // 小区名称
  const name = ele.querySelector('div.title > a').innerText;
  // 小区链接
  const link = ele.querySelector('div.title > a').href;
  // 租售详情
  const [soldInfo, rentInfo] = ele.querySelector('div.houseInfo').innerText.split('|');
  // 建成时间
  const buildYear = ele.querySelector('.positionInfo').innerText.split('/')[1].slice(1, 5);
  // 单价
  const unitPrice = ele.querySelector('.totalPrice').innerText;
  // 在售套数
  const count = ele.querySelector('.totalSellCount span').innerText;
  
  const res = {
    // 用不了 es6 语法
    code: code,
    link: link,
    name: name,
    buildYear: buildYear,
    soldInfo: soldInfo,
    rentInfo: rentInfo,
    unitPrice: unitPrice,
    count: count,
  }

  return res;
})
