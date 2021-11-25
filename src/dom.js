/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-11-23 13:26:48
 * @LastEditTime: 2021-11-25 15:43:30
 */

exports.domLinks = eles => eles.map(ele => ({
  link: ele.href,
  name: ele.innerText,
}))

exports.domTotalPage = ele => JSON.parse(ele.getAttribute('page-data')).totalPage;

exports.domHouses = eles => eles.map(ele => {
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
exports.domCommunities = eles => eles.map(ele => {
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

exports.domCommunityDetails = body => {
  // 小区地址
  const address = body.querySelector('.detailDesc').innerText;

  // 小区基础属性
  let lis = body.querySelectorAll('.xiaoquInfo .xiaoquInfoItem span:last-child')
  lis = Array.from(lis).map(ele => ele.innerText.replaceAll(`"`, ''));
  const [, buildType, propertyFee, propertyManager, developer, buildingCount, houseCount] = lis;

  let longitude, latitude;

  let latlng = body.querySelector('.actshowMap');
  if (latlng) {
    [longitude, latitude] = JSON.parse(latlng.getAttribute('xiaoqu'));
  } else {
    let scripts = body.querySelectorAll('script[type="text/javascript"]');
    for (let script of scripts) {
      const res = script.innerText.match(/resblockPosition:'(\S*)',/)
      if (res) {
        [longitude, latitude] = res[0].split(':')[1].split(',');
        break;
      }
    }
  }

  return { address, buildType, propertyFee, propertyManager, developer, buildingCount, houseCount, longitude, latitude }
}

exports.domHouseDetails = body => {
  // 获取交易属性
  let transaction = body.querySelectorAll('.transaction li span:nth-child(2)');
  transaction = Array.from(transaction).map(ele => ele.innerText);
  const [listTime, ownership, lastDealTime, houseUsage, ageLimit, propertyRight, mortgage, certificate, checkCode] = transaction;
  
  // 获取基础属性
  let base = body.querySelectorAll('.base li');
  base = Array.from(base).map(ele => ele.innerText.slice(4));

  // 根据房屋用途，获取不同的基础属性值
  let baseObj = {};
  switch (houseUsage) {
    case "车库": {
      const [floor, buildingArea, orientation] = base;
      baseObj = {floor, buildingArea, orientation};
      break;
    }
    case "别墅": {
      const [houseType, floor, buildingArea, insideArea, orientation, buildingStructure, decoration, villaType] = base;
      baseObj = {houseType, floor, buildingArea, insideArea, orientation, buildingStructure, decoration, villaType};
      break;
    }
    case "商住两用": {
      const [houseType, floor, buildingArea, houseStructure, insideArea, buildingType, orientation, buildingStructure, decoration, elevatorRatio, elevator, waterType, electricityType, gasPrice] = base;
      baseObj = {houseType, floor, buildingArea, houseStructure, insideArea, buildingType, orientation, buildingStructure, decoration, elevatorRatio, elevator, waterType, electricityType, gasPrice};
      break;
    }
    case "普通住宅":{
      const [houseType, floor, buildingArea, houseStructure, insideArea, buildingType, orientation, buildingStructure, decoration, elevatorRatio, elevator] = base;
      baseObj = {houseType, floor, buildingArea, houseStructure, insideArea, buildingType, orientation, buildingStructure, decoration, elevatorRatio, elevator};
      break;
    }
    default:
      throw "房屋用途不匹配!";
  }

  return {listTime, ownership, lastDealTime, houseUsage, ageLimit, propertyRight, mortgage, certificate, checkCode, ...baseObj};
}
