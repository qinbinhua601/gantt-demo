/**
 * https://juejin.cn/post/7185775310242381879
 * https://timor.tech/api/holiday/
 */
const holidays = {
  "01-01": {
    "holiday": true,
    "name": "元旦",
    "wage": 3,
    "date": "2024-01-01",
    "rest": 1
  },
  "02-04": {
    "holiday": false,
    "name": "春节前补班",
    "wage": 1,
    "after": false,
    "target": "春节",
    "date": "2024-02-04",
    "rest": 34
  },
  "02-10": {
    "holiday": true,
    "name": "初一",
    "wage": 3,
    "date": "2024-02-10",
    "rest": 40
  },
  "02-11": {
    "holiday": true,
    "name": "初二",
    "wage": 3,
    "date": "2024-02-11"
  },
  "02-12": {
    "holiday": true,
    "name": "初三",
    "wage": 3,
    "date": "2024-02-12"
  },
  "02-13": {
    "holiday": true,
    "name": "初四",
    "wage": 2,
    "date": "2024-02-13"
  },
  "02-14": {
    "holiday": true,
    "name": "初五",
    "wage": 2,
    "date": "2024-02-14"
  },
  "02-15": {
    "holiday": true,
    "name": "初六",
    "wage": 2,
    "date": "2024-02-15"
  },
  "02-16": {
    "holiday": true,
    "name": "初七",
    "wage": 2,
    "date": "2024-02-16"
  },
  "02-17": {
    "holiday": true,
    "name": "初八",
    "wage": 2,
    "date": "2024-02-17"
  },
  "02-18": {
    "holiday": false,
    "name": "春节后补班",
    "wage": 1,
    "after": true,
    "target": "春节",
    "date": "2024-02-18"
  },
  "04-04": {
    "holiday": true,
    "name": "清明节",
    "wage": 3,
    "date": "2024-04-04",
    "rest": 46
  },
  "04-05": {
    "holiday": true,
    "name": "清明节",
    "wage": 2,
    "date": "2024-04-05"
  },
  "04-06": {
    "holiday": true,
    "name": "清明节",
    "wage": 2,
    "date": "2024-04-06"
  },
  "04-07": {
    "holiday": false,
    "name": "清明节后补班",
    "wage": 1,
    "target": "清明节",
    "after": true,
    "date": "2024-04-07"
  },
  "04-28": {
    "holiday": false,
    "name": "劳动节前补班",
    "wage": 1,
    "target": "劳动节",
    "after": false,
    "date": "2024-04-28"
  },
  "05-01": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2024-05-01"
  },
  "05-02": {
    "holiday": true,
    "name": "劳动节",
    "wage": 2,
    "date": "2024-05-02"
  },
  "05-03": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2024-05-03"
  },
  "05-04": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2024-05-04"
  },
  "05-05": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2024-05-05"
  },
  "05-11": {
    "holiday": false,
    "name": "劳动节后补班",
    "after": true,
    "wage": 1,
    "target": "劳动节",
    "date": "2024-05-11"
  },
  "06-08": {
    "holiday": true,
    "name": "端午节",
    "wage": 2,
    "date": "2024-06-08"
  },
  "06-09": {
    "holiday": true,
    "name": "端午节",
    "wage": 2,
    "date": "2024-06-09"
  },
  "06-10": {
    "holiday": true,
    "name": "端午节",
    "wage": 3,
    "date": "2024-06-10"
  },
  "09-14": {
    "holiday": false,
    "name": "中秋节前补班",
    "after": false,
    "wage": 1,
    "target": "中秋节",
    "date": "2024-09-14"
  },
  "09-15": {
    "holiday": true,
    "name": "中秋节",
    "wage": 2,
    "date": "2024-09-15"
  },
  "09-16": {
    "holiday": true,
    "name": "中秋节",
    "wage": 2,
    "date": "2024-09-16"
  },
  "09-17": {
    "holiday": true,
    "name": "中秋节",
    "wage": 3,
    "date": "2024-09-17"
  },
  "09-29": {
    "holiday": false,
    "name": "国庆节前补班",
    "after": false,
    "wage": 1,
    "target": "国庆节",
    "date": "2024-09-29"
  },
  "10-01": {
    "holiday": true,
    "name": "国庆节",
    "wage": 3,
    "date": "2024-10-01"
  },
  "10-02": {
    "holiday": true,
    "name": "国庆节",
    "wage": 3,
    "date": "2024-10-02",
    "rest": 1
  },
  "10-03": {
    "holiday": true,
    "name": "国庆节",
    "wage": 3,
    "date": "2024-10-03"
  },
  "10-04": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2024-10-04"
  },
  "10-05": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2024-10-05"
  },
  "10-06": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2024-10-06",
    "rest": 1
  },
  "10-07": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2024-10-07",
    "rest": 1
  },
  "10-12": {
    "holiday": false,
    "after": true,
    "wage": 1,
    "name": "国庆节后补班",
    "target": "国庆节",
    "date": "2024-10-12"
  },
  "01-01": {
    "holiday": true,
    "name": "元旦",
    "wage": 3,
    "date": "2025-01-01",
    "rest": 13
  },
  "01-26": {
    "holiday": false,
    "name": "春节前补班",
    "wage": 1,
    "after": false,
    "target": "春节",
    "date": "2025-01-26",
    "rest": 22
  },
  "01-28": {
    "holiday": true,
    "name": "除夕",
    "wage": 2,
    "date": "2025-01-28",
    "rest": 24
  },
  "01-29": {
    "holiday": true,
    "name": "初一",
    "wage": 3,
    "date": "2025-01-29",
    "rest": 1
  },
  "01-30": {
    "holiday": true,
    "name": "初二",
    "wage": 3,
    "date": "2025-01-30",
    "rest": 1
  },
  "01-31": {
    "holiday": true,
    "name": "初三",
    "wage": 3,
    "date": "2025-01-31",
    "rest": 1
  },
  "02-01": {
    "holiday": true,
    "name": "初四",
    "wage": 2,
    "date": "2025-02-01",
    "rest": 1
  },
  "02-02": {
    "holiday": true,
    "name": "初五",
    "wage": 2,
    "date": "2025-02-02",
    "rest": 1
  },
  "02-03": {
    "holiday": true,
    "name": "初六",
    "wage": 2,
    "date": "2025-02-03",
    "rest": 1
  },
  "02-04": {
    "holiday": true,
    "name": "初七",
    "wage": 2,
    "date": "2025-02-04",
    "rest": 1
  },
  "02-08": {
    "holiday": false,
    "name": "春节后补班",
    "wage": 1,
    "target": "春节",
    "after": true,
    "date": "2025-02-08",
    "rest": 4
  },
  "04-04": {
    "holiday": true,
    "name": "清明节",
    "wage": 3,
    "date": "2025-04-04",
    "rest": 16
  },
  "04-05": {
    "holiday": true,
    "name": "清明节",
    "wage": 2,
    "date": "2025-04-05",
    "rest": 1
  },
  "04-06": {
    "holiday": true,
    "name": "清明节",
    "wage": 2,
    "date": "2025-04-06",
    "rest": 1
  },
  "04-27": {
    "holiday": false,
    "name": "劳动节前补班",
    "wage": 1,
    "target": "劳动节",
    "after": false,
    "date": "2025-04-27",
    "rest": 21
  },
  "05-01": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2025-05-01",
    "rest": 25
  },
  "05-02": {
    "holiday": true,
    "name": "劳动节",
    "wage": 2,
    "date": "2025-05-02",
    "rest": 1
  },
  "05-03": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2025-05-03",
    "rest": 1
  },
  "05-04": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2025-05-04"
  },
  "05-05": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2025-05-05"
  },
  "05-31": {
    "holiday": true,
    "name": "端午节",
    "wage": 3,
    "date": "2025-05-31"
  },
  "06-01": {
    "holiday": true,
    "name": "端午节",
    "wage": 2,
    "date": "2025-06-01"
  },
  "06-02": {
    "holiday": true,
    "name": "端午节",
    "wage": 2,
    "date": "2025-06-02"
  },
  "09-28": {
    "holiday": false,
    "name": "国庆节前补班",
    "after": false,
    "wage": 1,
    "target": "国庆节",
    "date": "2025-09-28"
  },
  "10-01": {
    "holiday": true,
    "name": "国庆节",
    "wage": 3,
    "date": "2025-10-01"
  },
  "10-02": {
    "holiday": true,
    "name": "国庆节",
    "wage": 3,
    "date": "2025-10-02"
  },
  "10-03": {
    "holiday": true,
    "name": "国庆节",
    "wage": 3,
    "date": "2025-10-03"
  },
  "10-04": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2025-10-04"
  },
  "10-05": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2025-10-05"
  },
  "10-06": {
    "holiday": true,
    "name": "中秋节",
    "wage": 2,
    "date": "2025-10-06"
  },
  "10-07": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2025-10-07"
  },
  "10-08": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2025-10-08"
  },
  "10-11": {
    "holiday": false,
    "after": true,
    "wage": 1,
    "name": "国庆节后补班",
    "target": "国庆节",
    "date": "2025-10-11"
  },
  "01-01": {
    "holiday": true,
    "name": "元旦",
    "wage": 3,
    "date": "2026-01-01",
    "rest": 6
  },
  "01-02": {
    "holiday": true,
    "name": "元旦",
    "wage": 2,
    "date": "2026-01-02",
    "rest": 1
  },
  "01-03": {
    "holiday": true,
    "name": "元旦",
    "wage": 2,
    "date": "2026-01-03",
    "rest": 1
  },
  "01-04": {
    "holiday": false,
    "name": "元旦后补班",
    "wage": 1,
    "after": true,
    "target": "元旦",
    "date": "2026-01-04",
    "rest": 1
  },
  "02-14": {
    "holiday": false,
    "name": "春节前补班",
    "wage": 1,
    "after": false,
    "target": "春节",
    "date": "2026-02-14",
    "rest": 21
  },
  "02-15": {
    "holiday": true,
    "name": "春节",
    "wage": 2,
    "date": "2026-02-15",
    "rest": 22
  },
  "02-16": {
    "holiday": true,
    "name": "除夕",
    "wage": 3,
    "date": "2026-02-16",
    "rest": 1
  },
  "02-17": {
    "holiday": true,
    "name": "初一",
    "wage": 3,
    "date": "2026-02-17",
    "rest": 1
  },
  "02-18": {
    "holiday": true,
    "name": "初二",
    "wage": 3,
    "date": "2026-02-18",
    "rest": 1
  },
  "02-19": {
    "holiday": true,
    "name": "初三",
    "wage": 3,
    "date": "2026-02-19",
    "rest": 1
  },
  "02-20": {
    "holiday": true,
    "name": "初四",
    "wage": 2,
    "date": "2026-02-20",
    "rest": 1
  },
  "02-21": {
    "holiday": true,
    "name": "初五",
    "wage": 2,
    "date": "2026-02-21",
    "rest": 1
  },
  "02-22": {
    "holiday": true,
    "name": "初六",
    "wage": 2,
    "date": "2026-02-22",
    "rest": 1
  },
  "02-23": {
    "holiday": true,
    "name": "初七",
    "wage": 2,
    "date": "2026-02-23",
    "rest": 1
  },
  "02-28": {
    "holiday": false,
    "name": "春节后补班",
    "wage": 1,
    "target": "春节",
    "after": true,
    "date": "2026-02-28",
    "rest": 3
  },
  "04-04": {
    "holiday": true,
    "name": "清明节",
    "wage": 2,
    "date": "2026-04-04",
    "rest": 34
  },
  "04-05": {
    "holiday": true,
    "name": "清明节",
    "wage": 3,
    "date": "2026-04-05",
    "rest": 1
  },
  "04-06": {
    "holiday": true,
    "name": "清明节",
    "wage": 2,
    "date": "2026-04-06",
    "rest": 1
  },
  "05-01": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2026-05-01",
    "rest": 25
  },
  "05-02": {
    "holiday": true,
    "name": "劳动节",
    "wage": 3,
    "date": "2026-05-02",
    "rest": 1
  },
  "05-03": {
    "holiday": true,
    "name": "劳动节",
    "wage": 2,
    "date": "2026-05-03",
    "rest": 1
  },
  "05-04": {
    "holiday": true,
    "name": "劳动节",
    "wage": 2,
    "date": "2026-05-04",
    "rest": 1
  },
  "05-05": {
    "holiday": true,
    "name": "劳动节",
    "wage": 2,
    "date": "2026-05-05",
    "rest": 1
  },
  "05-09": {
    "holiday": false,
    "name": "劳动节后补班",
    "wage": 1,
    "after": true,
    "target": "劳动节",
    "date": "2026-05-09",
    "rest": 4
  },
  "06-19": {
    "holiday": true,
    "name": "端午节",
    "wage": 3,
    "date": "2026-06-19",
    "rest": 45
  },
  "06-20": {
    "holiday": true,
    "name": "端午节",
    "wage": 2,
    "date": "2026-06-20",
    "rest": 1
  },
  "06-21": {
    "holiday": true,
    "name": "端午节",
    "wage": 2,
    "date": "2026-06-21",
    "rest": 1
  },
  "09-20": {
    "holiday": false,
    "name": "中秋节前补班",
    "after": false,
    "wage": 1,
    "target": "中秋节",
    "date": "2026-09-20",
    "rest": 91
  },
  "09-25": {
    "holiday": true,
    "name": "中秋节",
    "wage": 3,
    "date": "2026-09-25",
    "rest": 96
  },
  "09-26": {
    "holiday": true,
    "name": "中秋节",
    "wage": 2,
    "date": "2026-09-26",
    "rest": 1
  },
  "09-27": {
    "holiday": true,
    "name": "中秋节",
    "wage": 2,
    "date": "2026-09-27",
    "rest": 1
  },
  "10-01": {
    "holiday": true,
    "name": "国庆节",
    "wage": 3,
    "date": "2026-10-01",
    "rest": 4
  },
  "10-02": {
    "holiday": true,
    "name": "国庆节",
    "wage": 3,
    "date": "2026-10-02",
    "rest": 1
  },
  "10-03": {
    "holiday": true,
    "name": "国庆节",
    "wage": 3,
    "date": "2026-10-03",
    "rest": 1
  },
  "10-04": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2026-10-04",
    "rest": 1
  },
  "10-05": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2026-10-05",
    "rest": 1
  },
  "10-06": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2026-10-06",
    "rest": 1
  },
  "10-07": {
    "holiday": true,
    "name": "国庆节",
    "wage": 2,
    "date": "2026-10-07",
    "rest": 1
  },
  "10-10": {
    "holiday": false,
    "after": true,
    "wage": 1,
    "name": "国庆节后补班",
    "target": "国庆节",
    "date": "2026-10-10"
  }
}

export function isHoliday(dateString) {
  const d = new Date(dateString);
  const month = (d.getMonth() + 1 + '');
  const monthWithPadding = month.padStart(2, '0');
  const day = (d.getDate() + '')
  const dayWithPadding = day.padStart(2, '0')
  const date_key = `${monthWithPadding}-${dayWithPadding}`;
  const isWeekend = ([0, 6].indexOf(d.getDay()) != -1);
  if (holidays[date_key]) {
    return {
      isHoliday: holidays[date_key].holiday,
      dateString: `${month}-${day}`
    }
  }
  return {
    isHoliday: isWeekend,
    dateString: `${month}-${day}`
  }
}