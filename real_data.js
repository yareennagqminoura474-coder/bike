// real_data.js - 真实骑行数据源
// 数据来源: Capital Bikeshare (部分采样)
// 已适配 JXNU 智行仿真系统的解析逻辑

const realMobikeData = [
  {
    "started_at": "56:26.1",
    "ended_at": "02:56.4",
    "start_station_name": "8th & K St NE",
    "start_station_id": "31660",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "12:11.9",
    "ended_at": "17:58.2",
    "start_station_name": "8th & K St NE",
    "start_station_id": "31660",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "17:51.8",
    "ended_at": "21:45.2",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "11:24.3",
    "ended_at": "15:32.6",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "54:26.2",
    "ended_at": "01:43.1",
    "start_station_name": "2nd St & Seaton Pl NE",
    "start_station_id": "31522",
    "end_station_name": "John McCormack Rd & Michigan Ave NE",
    "end_station_id": "31502"
  },
  {
    "started_at": "26:23.8",
    "ended_at": "31:04.9",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "1st & L St NW",
    "end_station_id": "31677"
  },
  {
    "started_at": "15:30.0",
    "ended_at": "20:30.0",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "1st & L St NW",
    "end_station_id": "31677"
  },
  {
    "started_at": "45:34.1",
    "ended_at": "00:42.7",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "59:47.9",
    "ended_at": "08:28.8",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "18th & R St NW",
    "end_station_id": "31278"
  },
  {
    "started_at": "33:30.4",
    "ended_at": "37:45.5",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "52:14.6",
    "ended_at": "13:00.8",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "Waterfront Park",
    "end_station_id": "31673"
  },
  {
    "started_at": "00:03.5",
    "ended_at": "14:10.7",
    "start_station_name": "2nd St & Seaton Pl NE",
    "start_station_id": "31522",
    "end_station_name": "3rd & K St NW",
    "end_station_id": "33002"
  },
  {
    "started_at": "37:27.2",
    "ended_at": "48:32.6",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "40:05.9",
    "ended_at": "50:15.5",
    "start_station_name": "Market Square / King St & Royal St",
    "start_station_id": "31042",
    "end_station_name": "Braddock Rd Metro South",
    "end_station_id": "31969"
  },
  {
    "started_at": "07:00.5",
    "ended_at": "13:58.4",
    "start_station_name": "Rosedale Rec Center",
    "start_station_id": "31658",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "45:20.2",
    "ended_at": "54:36.2",
    "start_station_name": "Pentagon City Metro / 12th St & S Hayes St",
    "start_station_id": "31005",
    "end_station_name": "Rolfe St & 9th St S",
    "end_station_id": "31075"
  },
  {
    "started_at": "01:19.8",
    "ended_at": "11:47.3",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "55:25.7",
    "ended_at": "29:49.4",
    "start_station_name": "Madron Ln & Bermudez Ct",
    "start_station_id": "32271",
    "end_station_name": "East Falls Church Metro / Sycamore St & 19th St N",
    "end_station_id": "31904"
  },
  {
    "started_at": "04:28.2",
    "ended_at": "09:10.6",
    "start_station_name": "Potomac Ave & Half St SW",
    "start_station_id": "31648",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "26:41.8",
    "ended_at": "34:50.0",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "36:20.7",
    "ended_at": "41:00.9",
    "start_station_name": "W Columbia St & N Washington St",
    "start_station_id": "32609",
    "end_station_name": "East Falls Church Metro / Sycamore St & 19th St N",
    "end_station_id": "31904"
  },
  {
    "started_at": "50:03.3",
    "ended_at": "03:45.9",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "11:45.3",
    "ended_at": "22:55.4",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "38:03.0",
    "ended_at": "43:22.5",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "36:11.8",
    "ended_at": "41:42.9",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "28:02.3",
    "ended_at": "40:42.8",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "09:09.9",
    "ended_at": "29:35.7",
    "start_station_name": "Virginia Ave & C St NW",
    "start_station_id": "31261",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "43:47.3",
    "ended_at": "03:57.2",
    "start_station_name": "Virginia Ave & C St NW",
    "start_station_id": "31261",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "54:22.7",
    "ended_at": "03:39.1",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "36:28.5",
    "ended_at": "50:59.2",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "41:41.9",
    "ended_at": "56:23.9",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "27:35.5",
    "ended_at": "41:26.3",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "45:52.1",
    "ended_at": "50:02.4",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "08:13.5",
    "ended_at": "13:05.5",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "39:10.0",
    "ended_at": "54:16.7",
    "start_station_name": "8th & Eye St SE / Barracks Row",
    "start_station_id": "31608",
    "end_station_name": "10th & K St NW",
    "end_station_id": "31263"
  },
  {
    "started_at": "37:18.7",
    "ended_at": "48:01.3",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "25th St & Pennsylvania Ave NW",
    "end_station_id": "31237"
  },
  {
    "started_at": "53:28.7",
    "ended_at": "57:24.7",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "54:22.8",
    "ended_at": "38:59.0",
    "start_station_name": "MLK & Marion Barry Ave SE",
    "start_station_id": "31802",
    "end_station_name": "Anacostia Ave & East Capitol St NE",
    "end_station_id": "31721"
  },
  {
    "started_at": "32:50.9",
    "ended_at": "20:54.6",
    "start_station_name": "MLK & Marion Barry Ave SE",
    "start_station_id": "31802",
    "end_station_name": "Anacostia Ave & East Capitol St NE",
    "end_station_id": "31721"
  },
  {
    "started_at": "33:14.2",
    "ended_at": "21:11.8",
    "start_station_name": "MLK & Marion Barry Ave SE",
    "start_station_id": "31802",
    "end_station_name": "Anacostia Ave & East Capitol St NE",
    "end_station_id": "31721"
  },
  {
    "started_at": "09:51.6",
    "ended_at": "28:48.3",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "21st St & N Pierce St",
    "end_station_id": "31093"
  },
  {
    "started_at": "50:24.0",
    "ended_at": "50:59.1",
    "start_station_name": "20th & E St NW",
    "start_station_id": "31204",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "49:27.6",
    "ended_at": "08:23.5",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "21st St & N Pierce St",
    "end_station_id": "31093"
  },
  {
    "started_at": "25:58.2",
    "ended_at": "32:56.2",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "21st St & N Pierce St",
    "end_station_id": "31093"
  },
  {
    "started_at": "02:42.9",
    "ended_at": "11:39.7",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "25:01.6",
    "ended_at": "37:47.8",
    "start_station_name": "1st & L St NW",
    "start_station_id": "31677",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "07:52.9",
    "ended_at": "14:22.7",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "00:46.7",
    "ended_at": "09:17.2",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "47:08.2",
    "ended_at": "58:28.9",
    "start_station_name": "2nd St & Seaton Pl NE",
    "start_station_id": "31522",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "11:00.2",
    "ended_at": "48:53.9",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "Fort Totten Dr & Crittenden St NE",
    "end_station_id": "31731"
  },
  {
    "started_at": "28:32.3",
    "ended_at": "35:42.9",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "08:43.9",
    "ended_at": "13:00.9",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "58:54.2",
    "ended_at": "04:41.2",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "07:36.2",
    "ended_at": "11:53.6",
    "start_station_name": "Kansas Ave & Blair Rd NW",
    "start_station_id": "33201",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "24:54.6",
    "ended_at": "35:21.8",
    "start_station_name": "1st & L St NW",
    "start_station_id": "31677",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "14:58.2",
    "ended_at": "19:11.9",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "16:10.4",
    "ended_at": "25:05.6",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "Rosslyn Metro / Wilson Blvd & N Moore St",
    "end_station_id": "31947"
  },
  {
    "started_at": "34:50.9",
    "ended_at": "47:17.9",
    "start_station_name": "Woodley Park Metro / Calvert St & Connecticut Ave NW",
    "start_station_id": "31323",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "18:59.5",
    "ended_at": "22:34.0",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "53:25.2",
    "ended_at": "00:20.1",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "34:56.5",
    "ended_at": "41:14.0",
    "start_station_name": "20th St & Florida Ave NW",
    "start_station_id": "31110",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "23:11.5",
    "ended_at": "35:53.8",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "20:39.9",
    "ended_at": "32:44.5",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "29:34.2",
    "ended_at": "41:47.3",
    "start_station_name": "Pentagon City Metro / 12th St & S Hayes St",
    "start_station_id": "31005",
    "end_station_name": "Long Bridge Aquatic Center",
    "end_station_id": "31950"
  },
  {
    "started_at": "28:24.8",
    "ended_at": "42:43.9",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "34th St & Wisconsin Ave NW",
    "end_station_id": "31226"
  },
  {
    "started_at": "38:48.7",
    "ended_at": "51:38.4",
    "start_station_name": "Hains Point/Buckeye & Ohio Dr SW",
    "start_station_id": "31273",
    "end_station_name": "Hains Point/Buckeye & Ohio Dr SW",
    "end_station_id": "31273"
  },
  {
    "started_at": "55:44.9",
    "ended_at": "12:19.5",
    "start_station_name": "15th & F St NE",
    "start_station_id": "31632",
    "end_station_name": "4th & College St NW",
    "end_station_id": "31138"
  },
  {
    "started_at": "03:36.0",
    "ended_at": "18:26.4",
    "start_station_name": "15th & F St NE",
    "start_station_id": "31632",
    "end_station_name": "4th & College St NW",
    "end_station_id": "31138"
  },
  {
    "started_at": "35:06.4",
    "ended_at": "39:43.9",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "54:55.7",
    "ended_at": "02:54.1",
    "start_station_name": "S Four Mile Run Dr & Walter Reed Dr",
    "start_station_id": "31059",
    "end_station_name": "Columbia Pike & S George Mason Dr",
    "end_station_id": "31923"
  },
  {
    "started_at": "48:57.3",
    "ended_at": "52:58.2",
    "start_station_name": "N Pershing Dr & N George Mason Dr",
    "start_station_id": "31069",
    "end_station_name": "Columbia Pike & S George Mason Dr",
    "end_station_id": "31923"
  },
  {
    "started_at": "03:15.4",
    "ended_at": "11:39.4",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "27:02.9",
    "ended_at": "36:11.8",
    "start_station_name": "Washington Blvd & Walter Reed Dr ",
    "start_station_id": "31073",
    "end_station_name": "15th St & N Scott St",
    "end_station_id": "31031"
  },
  {
    "started_at": "36:58.8",
    "ended_at": "37:02.5",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "34th St & Wisconsin Ave NW",
    "end_station_id": "31226"
  },
  {
    "started_at": "41:01.5",
    "ended_at": "50:56.5",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "Wisconsin Ave & Upton St NW",
    "end_station_id": "31393"
  },
  {
    "started_at": "28:23.4",
    "ended_at": "36:54.5",
    "start_station_name": "8th & Eye St SE / Barracks Row",
    "start_station_id": "31608",
    "end_station_name": "8th & Eye St SE / Barracks Row",
    "end_station_id": "31608"
  },
  {
    "started_at": "21:55.1",
    "ended_at": "27:50.1",
    "start_station_name": "8th & Eye St SE / Barracks Row",
    "start_station_id": "31608",
    "end_station_name": "Half & I St SW ",
    "end_station_id": "31680"
  },
  {
    "started_at": "09:44.4",
    "ended_at": "10:32.8",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "34th St & Wisconsin Ave NW",
    "end_station_id": "31226"
  },
  {
    "started_at": "53:24.4",
    "ended_at": "54:03.3",
    "start_station_name": "Long Bridge Aquatic Center",
    "start_station_id": "31950",
    "end_station_name": "Long Bridge Aquatic Center",
    "end_station_id": "31950"
  },
  {
    "started_at": "44:06.4",
    "ended_at": "09:14.6",
    "start_station_name": "W Columbia St & N Washington St",
    "start_station_id": "32609",
    "end_station_name": "W Columbia St & N Washington St",
    "end_station_id": "32609"
  },
  {
    "started_at": "03:30.0",
    "ended_at": "05:58.0",
    "start_station_name": "Wisconsin Ave & Upton St NW",
    "start_station_id": "31393",
    "end_station_name": "Wisconsin Ave & Upton St NW",
    "end_station_id": "31393"
  },
  {
    "started_at": "50:36.4",
    "ended_at": "03:00.6",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "Wisconsin Ave & Upton St NW",
    "end_station_id": "31393"
  },
  {
    "started_at": "25:16.6",
    "ended_at": "32:32.3",
    "start_station_name": "8th & Eye St SE / Barracks Row",
    "start_station_id": "31608",
    "end_station_name": "8th & Eye St SE / Barracks Row",
    "end_station_id": "31608"
  },
  {
    "started_at": "28:47.6",
    "ended_at": "33:43.6",
    "start_station_name": "Half & I St SW ",
    "start_station_id": "31680",
    "end_station_name": "8th & Eye St SE / Barracks Row",
    "end_station_id": "31608"
  },
  {
    "started_at": "52:54.6",
    "ended_at": "58:06.0",
    "start_station_name": "8th & Eye St SE / Barracks Row",
    "start_station_id": "31608",
    "end_station_name": "Half & I St SW ",
    "end_station_id": "31680"
  },
  {
    "started_at": "27:23.5",
    "ended_at": "30:07.2",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "34:41.1",
    "ended_at": "58:05.5",
    "start_station_name": "MLK & Marion Barry Ave SE",
    "start_station_id": "31802",
    "end_station_name": "Half & I St SW ",
    "end_station_id": "31680"
  },
  {
    "started_at": "14:59.2",
    "ended_at": "29:22.8",
    "start_station_name": "Columbia Pike & W&OD Trail ",
    "start_station_id": "31981",
    "end_station_name": "28th St & S Meade St",
    "end_station_id": "31055"
  },
  {
    "started_at": "52:58.6",
    "ended_at": "56:27.7",
    "start_station_name": "Columbia Pike & S Walter Reed Dr",
    "start_station_id": "31067",
    "end_station_name": " S Scott St & 12th St",
    "end_station_id": "31949"
  },
  {
    "started_at": "36:26.8",
    "ended_at": "58:27.8",
    "start_station_name": "MLK & Marion Barry Ave SE",
    "start_station_id": "31802",
    "end_station_name": "Half & I St SW ",
    "end_station_id": "31680"
  },
  {
    "started_at": "00:47.9",
    "ended_at": "11:17.8",
    "start_station_name": "Connecticut Ave & McKinley St NW",
    "start_station_id": "31315",
    "end_station_name": "Wisconsin Ave & Upton St NW",
    "end_station_id": "31393"
  },
  {
    "started_at": "39:11.7",
    "ended_at": "42:40.5",
    "start_station_name": "1st & I St SE",
    "start_station_id": "31628",
    "end_station_name": "Half & I St SW ",
    "end_station_id": "31680"
  },
  {
    "started_at": "37:50.8",
    "ended_at": "43:36.4",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "39:41.7",
    "ended_at": "54:35.6",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Woodley Park Metro / Calvert St & Connecticut Ave NW",
    "end_station_id": "31323"
  },
  {
    "started_at": "30:23.2",
    "ended_at": "36:28.2",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "48:02.0",
    "ended_at": "00:29.6",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "34th St & Wisconsin Ave NW",
    "end_station_id": "31226"
  },
  {
    "started_at": "30:34.7",
    "ended_at": "35:06.5",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "13:59.4",
    "ended_at": "18:19.4",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "59:55.1",
    "ended_at": "02:45.4",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "37:30.3",
    "ended_at": "48:32.5",
    "start_station_name": "Rosedale Rec Center",
    "start_station_id": "31658",
    "end_station_name": "4th & College St NW",
    "end_station_id": "31138"
  },
  {
    "started_at": "32:39.5",
    "ended_at": "37:38.9",
    "start_station_name": "Potomac Ave & Half St SW",
    "start_station_id": "31648",
    "end_station_name": "Half & I St SW ",
    "end_station_id": "31680"
  },
  {
    "started_at": "16:46.8",
    "ended_at": "22:36.0",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "Woodley Park Metro / Calvert St & Connecticut Ave NW",
    "end_station_id": "31323"
  },
  {
    "started_at": "58:17.3",
    "ended_at": "54:58.2",
    "start_station_name": "Potomac Ave & 35th St S",
    "start_station_id": "31052",
    "end_station_name": "Roosevelt Island",
    "end_station_id": "31062"
  },
  {
    "started_at": "59:27.5",
    "ended_at": "54:38.2",
    "start_station_name": "Potomac Ave & 35th St S",
    "start_station_id": "31052",
    "end_station_name": "Roosevelt Island",
    "end_station_id": "31062"
  },
  {
    "started_at": "35:29.7",
    "ended_at": "43:28.6",
    "start_station_name": "Pentagon City Metro / 12th St & S Hayes St",
    "start_station_id": "31005",
    "end_station_name": " S Scott St & 12th St",
    "end_station_id": "31949"
  },
  {
    "started_at": "04:28.3",
    "ended_at": "27:49.0",
    "start_station_name": "New Mexico & Cathedral Ave NW",
    "start_station_id": "31394",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "55:57.2",
    "ended_at": "20:35.2",
    "start_station_name": "New Mexico & Cathedral Ave NW",
    "start_station_id": "31394",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "20:28.9",
    "ended_at": "30:11.8",
    "start_station_name": "New Mexico & Cathedral Ave NW",
    "start_station_id": "31394",
    "end_station_name": "34th St & Wisconsin Ave NW",
    "end_station_id": "31226"
  },
  {
    "started_at": "20:39.2",
    "ended_at": "37:53.6",
    "start_station_name": "Pentagon City Metro / 12th St & S Hayes St",
    "start_station_id": "31005",
    "end_station_name": " S Scott St & 12th St",
    "end_station_id": "31949"
  },
  {
    "started_at": "41:08.0",
    "ended_at": "49:43.4",
    "start_station_name": "Pentagon City Metro / 12th St & S Hayes St",
    "start_station_id": "31005",
    "end_station_name": " S Scott St & 12th St",
    "end_station_id": "31949"
  },
  {
    "started_at": "23:14.2",
    "ended_at": "39:00.4",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "Vermont Ave & I St NW",
    "end_station_id": "31291"
  },
  {
    "started_at": "23:50.3",
    "ended_at": "31:00.0",
    "start_station_name": "Pentagon City Metro / 12th St & S Hayes St",
    "start_station_id": "31005",
    "end_station_name": " S Scott St & 12th St",
    "end_station_id": "31949"
  },
  {
    "started_at": "56:18.8",
    "ended_at": "03:48.6",
    "start_station_name": "New Mexico & Cathedral Ave NW",
    "start_station_id": "31394",
    "end_station_name": "34th St & Wisconsin Ave NW",
    "end_station_id": "31226"
  },
  {
    "started_at": "48:37.9",
    "ended_at": "00:03.4",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "1st & L St NW",
    "end_station_id": "31677"
  },
  {
    "started_at": "46:18.1",
    "ended_at": "52:28.9",
    "start_station_name": "8th & K St NE",
    "start_station_id": "31660",
    "end_station_name": "M St & Delaware Ave NE",
    "end_station_id": "31627"
  },
  {
    "started_at": "12:33.5",
    "ended_at": "16:00.6",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "M St & Delaware Ave NE",
    "end_station_id": "31627"
  },
  {
    "started_at": "27:20.5",
    "ended_at": "34:45.1",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "11th & Kenyon St NW",
    "end_station_id": "31102"
  },
  {
    "started_at": "39:57.1",
    "ended_at": "47:50.3",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "11th & Kenyon St NW",
    "end_station_id": "31102"
  },
  {
    "started_at": "49:45.2",
    "ended_at": "56:20.9",
    "start_station_name": "Georgia & Missouri Ave NW",
    "start_station_id": "31411",
    "end_station_name": "Georgia Ave & Piney Branch Rd NW",
    "end_station_id": "31414"
  },
  {
    "started_at": "39:20.6",
    "ended_at": "43:01.1",
    "start_station_name": "8th & K St NE",
    "start_station_id": "31660",
    "end_station_name": "M St & Delaware Ave NE",
    "end_station_id": "31627"
  },
  {
    "started_at": "29:33.4",
    "ended_at": "35:21.5",
    "start_station_name": "S Randolph St & Campbell Ave",
    "start_station_id": "31076",
    "end_station_name": "S Kenmore St & 24th St S",
    "end_station_id": "31061"
  },
  {
    "started_at": "30:03.9",
    "ended_at": "15:11.8",
    "start_station_name": "Eisenhower Ave & Mill Race Ln",
    "start_station_id": "31082",
    "end_station_name": "Eads St & 22nd St S",
    "end_station_id": "31013"
  },
  {
    "started_at": "36:24.5",
    "ended_at": "39:54.9",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "Clarendon Blvd & N Fillmore St",
    "end_station_id": "31021"
  },
  {
    "started_at": "52:33.9",
    "ended_at": "05:36.1",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "Maine Ave & 7th St SW",
    "end_station_id": "31609"
  },
  {
    "started_at": "52:06.6",
    "ended_at": "02:06.3",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "17th St & Kalorama Rd NW",
    "end_station_id": "33101"
  },
  {
    "started_at": "48:07.0",
    "ended_at": "51:30.8",
    "start_station_name": "Barton St & 10th St N",
    "start_station_id": "31050",
    "end_station_name": "Clarendon Blvd & N Fillmore St",
    "end_station_id": "31021"
  },
  {
    "started_at": "55:58.0",
    "ended_at": "04:06.3",
    "start_station_name": "Half & I St SW ",
    "start_station_id": "31680",
    "end_station_name": "2nd & V St SW / James Creek Marina",
    "end_station_id": "31667"
  },
  {
    "started_at": "48:55.1",
    "ended_at": "53:49.8",
    "start_station_name": "Barton St & 10th St N",
    "start_station_id": "31050",
    "end_station_name": "Clarendon Blvd & N Fillmore St",
    "end_station_id": "31021"
  },
  {
    "started_at": "17:03.3",
    "ended_at": "39:29.6",
    "start_station_name": "Long Bridge Aquatic Center",
    "start_station_id": "31950",
    "end_station_name": "2nd & V St SW / James Creek Marina",
    "end_station_id": "31667"
  },
  {
    "started_at": "50:37.7",
    "ended_at": "54:41.9",
    "start_station_name": "Barton St & 10th St N",
    "start_station_id": "31050",
    "end_station_name": "Clarendon Blvd & N Fillmore St",
    "end_station_id": "31021"
  },
  {
    "started_at": "33:24.5",
    "ended_at": "43:00.3",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "14th & Girard St NW",
    "end_station_id": "31123"
  },
  {
    "started_at": "23:03.0",
    "ended_at": "32:37.2",
    "start_station_name": "Washington Blvd & Walter Reed Dr ",
    "start_station_id": "31073",
    "end_station_name": "Clarendon Blvd & N Fillmore St",
    "end_station_id": "31021"
  },
  {
    "started_at": "19:26.3",
    "ended_at": "37:06.0",
    "start_station_name": "Grant Circle",
    "start_station_id": "31421",
    "end_station_name": "14th & Girard St NW",
    "end_station_id": "31123"
  },
  {
    "started_at": "39:29.3",
    "ended_at": "50:56.5",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Edgewood Rec Center",
    "end_station_id": "31529"
  },
  {
    "started_at": "42:57.7",
    "ended_at": "47:43.0",
    "start_station_name": "20th St & Florida Ave NW",
    "start_station_id": "31110",
    "end_station_name": "17th St & Kalorama Rd NW",
    "end_station_id": "33101"
  },
  {
    "started_at": "36:29.3",
    "ended_at": "55:34.6",
    "start_station_name": "20th St & Florida Ave NW",
    "start_station_id": "31110",
    "end_station_name": "Maine Ave & 7th St SW",
    "end_station_id": "31609"
  },
  {
    "started_at": "42:59.9",
    "ended_at": "49:46.0",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "17th St & Kalorama Rd NW",
    "end_station_id": "33101"
  },
  {
    "started_at": "00:01.3",
    "ended_at": "14:10.5",
    "start_station_name": "8th & K St NE",
    "start_station_id": "31660",
    "end_station_name": "14th & G St NW",
    "end_station_id": "31238"
  },
  {
    "started_at": "25:04.1",
    "ended_at": "42:16.8",
    "start_station_name": "Rosedale Rec Center",
    "start_station_id": "31658",
    "end_station_name": "19th St & Constitution Ave NW",
    "end_station_id": "31235"
  },
  {
    "started_at": "50:33.2",
    "ended_at": "07:44.2",
    "start_station_name": "Rosedale Rec Center",
    "start_station_id": "31658",
    "end_station_name": "19th St & Constitution Ave NW",
    "end_station_id": "31235"
  },
  {
    "started_at": "39:32.3",
    "ended_at": "44:34.2",
    "start_station_name": "Market Square / King St & Royal St",
    "start_station_id": "31042",
    "end_station_name": "King St Metro North / Cameron St",
    "end_station_id": "31098"
  },
  {
    "started_at": "34:04.5",
    "ended_at": "38:24.2",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "58:26.6",
    "ended_at": "04:23.0",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "18:45.3",
    "ended_at": "21:55.0",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "10:07.5",
    "ended_at": "13:01.9",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "11:48.1",
    "ended_at": "15:02.4",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "19:08.8",
    "ended_at": "21:49.7",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "12:11.3",
    "ended_at": "14:58.0",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "08:18.9",
    "ended_at": "16:16.9",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "50:58.5",
    "ended_at": "58:24.6",
    "start_station_name": "3rd & D St SE",
    "start_station_id": "31605",
    "end_station_name": "Bladensburg Rd & Benning Rd NE",
    "end_station_id": "31617"
  },
  {
    "started_at": "51:04.2",
    "ended_at": "57:26.9",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "25th St & Pennsylvania Ave NW",
    "end_station_id": "31237"
  },
  {
    "started_at": "56:24.1",
    "ended_at": "10:19.8",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "15th & K St NW",
    "end_station_id": "31254"
  },
  {
    "started_at": "58:09.2",
    "ended_at": "14:28.4",
    "start_station_name": "Wisconsin Ave & Rodman St NW",
    "start_station_id": "31333",
    "end_station_name": "Georgia Ave & Emerson St NW",
    "end_station_id": "31405"
  },
  {
    "started_at": "36:03.2",
    "ended_at": "53:07.8",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "10th & K St NW",
    "end_station_id": "31263"
  },
  {
    "started_at": "43:59.9",
    "ended_at": "04:03.1",
    "start_station_name": "Aurora Hills Cmty Ctr / 18th St & S Hayes St",
    "start_station_id": "31004",
    "end_station_name": "Wilson Blvd & N Quinn St",
    "end_station_id": "31027"
  },
  {
    "started_at": "50:48.8",
    "ended_at": "04:47.1",
    "start_station_name": "Shady Grove Metro West",
    "start_station_id": "32045",
    "end_station_name": "Montgomery College / W Campus Dr & Mannakee St",
    "end_station_id": "32023"
  },
  {
    "started_at": "44:21.2",
    "ended_at": "46:19.7",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "15th & K St NW",
    "end_station_id": "31254"
  },
  {
    "started_at": "43:57.4",
    "ended_at": "48:51.8",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "10th & K St NW",
    "end_station_id": "31263"
  },
  {
    "started_at": "14:41.1",
    "ended_at": "19:20.1",
    "start_station_name": "Fenton St & New York Ave ",
    "start_station_id": "32001",
    "end_station_name": "Takoma Metro",
    "end_station_id": "31408"
  },
  {
    "started_at": "02:11.0",
    "ended_at": "07:43.0",
    "start_station_name": "Pooks Hill Rd & Linden Ave",
    "start_station_id": "32057",
    "end_station_name": "Old Georgetown Rd & Southwick St",
    "end_station_id": "32039"
  },
  {
    "started_at": "34:01.2",
    "ended_at": "39:37.4",
    "start_station_name": "Pooks Hill Rd & Linden Ave",
    "start_station_id": "32057",
    "end_station_name": "Old Georgetown Rd & Southwick St",
    "end_station_id": "32039"
  },
  {
    "started_at": "01:12.8",
    "ended_at": "06:50.7",
    "start_station_name": "Pooks Hill Rd & Linden Ave",
    "start_station_id": "32057",
    "end_station_name": "Old Georgetown Rd & Southwick St",
    "end_station_id": "32039"
  },
  {
    "started_at": "14:34.0",
    "ended_at": "19:33.2",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "28:03.2",
    "ended_at": "46:23.1",
    "start_station_name": "Tysons Metro North",
    "start_station_id": "32204",
    "end_station_name": "East Falls Church Metro / Sycamore St & 19th St N",
    "end_station_id": "31904"
  },
  {
    "started_at": "16:45.2",
    "ended_at": "48:23.0",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "01:29.0",
    "ended_at": "12:36.5",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "21st St & Pennsylvania Ave NW",
    "end_station_id": "31252"
  },
  {
    "started_at": "33:57.9",
    "ended_at": "38:34.1",
    "start_station_name": "Roosevelt Island",
    "start_station_id": "31062",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "10:17.5",
    "ended_at": "13:21.0",
    "start_station_name": "15th St & N Scott St",
    "start_station_id": "31031",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "56:46.3",
    "ended_at": "54:31.6",
    "start_station_name": "4th & College St NW",
    "start_station_id": "31138",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "00:56.2",
    "ended_at": "17:41.7",
    "start_station_name": "W Columbia St & N Washington St",
    "start_station_id": "32609",
    "end_station_name": "East Falls Church Metro / Sycamore St & 19th St N",
    "end_station_id": "31904"
  },
  {
    "started_at": "31:01.0",
    "ended_at": "33:10.4",
    "start_station_name": "Henry St & Pendleton St",
    "start_station_id": "31046",
    "end_station_name": "Braddock Rd Metro South",
    "end_station_id": "31969"
  },
  {
    "started_at": "37:12.4",
    "ended_at": "38:53.4",
    "start_station_name": "11th & O St NW",
    "start_station_id": "31286",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "48:00.1",
    "ended_at": "01:35.1",
    "start_station_name": "1st & I St SE",
    "start_station_id": "31628",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "51:40.6",
    "ended_at": "58:56.5",
    "start_station_name": "11th & O St NW",
    "start_station_id": "31286",
    "end_station_name": "21st St & Pennsylvania Ave NW",
    "end_station_id": "31252"
  },
  {
    "started_at": "07:26.7",
    "ended_at": "09:44.9",
    "start_station_name": "1st & L St NW",
    "start_station_id": "31677",
    "end_station_name": "3rd & K St NW",
    "end_station_id": "33002"
  },
  {
    "started_at": "02:33.1",
    "ended_at": "35:14.2",
    "start_station_name": "Wilson Blvd & N Quinn St",
    "start_station_id": "31027",
    "end_station_name": "3rd & K St NW",
    "end_station_id": "33002"
  },
  {
    "started_at": "36:14.2",
    "ended_at": "52:27.1",
    "start_station_name": "Eckington Pl & Q St NE",
    "start_station_id": "31505",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "19:16.9",
    "ended_at": "36:55.9",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "19:04.2",
    "ended_at": "25:57.5",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "54:07.9",
    "ended_at": "59:29.3",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "27:54.8",
    "ended_at": "32:22.4",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "37:19.5",
    "ended_at": "41:48.3",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "50:18.0",
    "ended_at": "05:58.6",
    "start_station_name": "North Capitol St & G Pl NE",
    "start_station_id": "31637",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "33:40.3",
    "ended_at": "39:20.7",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "51:57.6",
    "ended_at": "59:53.8",
    "start_station_name": "S Maple Ave & S Washington St",
    "start_station_id": "32607",
    "end_station_name": "East Falls Church Metro / Sycamore St & 19th St N",
    "end_station_id": "31904"
  },
  {
    "started_at": "25:45.7",
    "ended_at": "29:12.5",
    "start_station_name": "3rd & D St SE",
    "start_station_id": "31605",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "47:41.9",
    "ended_at": "56:03.2",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "27:17.1",
    "ended_at": "53:47.0",
    "start_station_name": "17th St & Independence Ave SW",
    "start_station_id": "31290",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "32:48.6",
    "ended_at": "41:47.7",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "39:35.2",
    "ended_at": "48:19.7",
    "start_station_name": "15th & F St NE",
    "start_station_id": "31632",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "51:13.3",
    "ended_at": "00:28.8",
    "start_station_name": "15th & F St NE",
    "start_station_id": "31632",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "31:25.6",
    "ended_at": "39:05.9",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "24:19.2",
    "ended_at": "29:46.2",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "00:13.2",
    "ended_at": "02:15.0",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "08:34.1",
    "ended_at": "14:57.2",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "38:57.4",
    "ended_at": "47:45.9",
    "start_station_name": "15th & F St NE",
    "start_station_id": "31632",
    "end_station_name": "3rd & K St NW",
    "end_station_id": "33002"
  },
  {
    "started_at": "28:10.7",
    "ended_at": "42:09.3",
    "start_station_name": "8th & East Capitol St NE",
    "start_station_id": "31629",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "02:06.0",
    "ended_at": "15:47.6",
    "start_station_name": "17th St & Independence Ave SW",
    "start_station_id": "31290",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "54:10.4",
    "ended_at": "05:44.7",
    "start_station_name": "S Maple Ave & S Washington St",
    "start_station_id": "32607",
    "end_station_name": "East Falls Church Metro / Sycamore St & 19th St N",
    "end_station_id": "31904"
  },
  {
    "started_at": "28:39.3",
    "ended_at": "38:17.5",
    "start_station_name": "15th & F St NE",
    "start_station_id": "31632",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "05:49.4",
    "ended_at": "11:07.1",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "56:51.9",
    "ended_at": "01:03.3",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "23:19.6",
    "ended_at": "29:45.1",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "22:21.7",
    "ended_at": "28:23.6",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "48:38.7",
    "ended_at": "55:32.5",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "29:54.7",
    "ended_at": "36:22.1",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "17:45.6",
    "ended_at": "28:26.6",
    "start_station_name": "20th & E St NW",
    "start_station_id": "31204",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "18:06.1",
    "ended_at": "20:58.7",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "12:43.6",
    "ended_at": "16:00.6",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "52:15.5",
    "ended_at": "56:11.4",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "48:50.3",
    "ended_at": "52:59.4",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "41:34.4",
    "ended_at": "51:01.8",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "52:29.1",
    "ended_at": "20:34.1",
    "start_station_name": "Kenilworth Terr & Hayes St. NE",
    "start_station_id": "31717",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "23:10.2",
    "ended_at": "57:26.9",
    "start_station_name": "Fenton St & New York Ave ",
    "start_station_id": "32001",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "41:23.1",
    "ended_at": "43:29.6",
    "start_station_name": "17th St & Potomac Ave SE / Congressional Cemetery ",
    "start_station_id": "31727",
    "end_station_name": "Stadium Armory Metro",
    "end_station_id": "31665"
  },
  {
    "started_at": "15:31.3",
    "ended_at": "19:12.3",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "55:11.0",
    "ended_at": "01:11.3",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "24:30.9",
    "ended_at": "37:23.3",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "3rd & K St NW",
    "end_station_id": "33002"
  },
  {
    "started_at": "55:28.9",
    "ended_at": "18:08.6",
    "start_station_name": "Fairfax Village",
    "start_station_id": "31706",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "36:13.9",
    "ended_at": "51:15.7",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "32:09.6",
    "ended_at": "46:54.8",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "10:28.3",
    "ended_at": "13:40.3",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "15:04.6",
    "ended_at": "17:45.4",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "04:28.0",
    "ended_at": "07:21.2",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "23:52.4",
    "ended_at": "31:40.9",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "38:25.7",
    "ended_at": "42:23.4",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "02:57.4",
    "ended_at": "10:08.4",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "08:42.8",
    "ended_at": "15:49.6",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "13:47.1",
    "ended_at": "16:49.6",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "35:26.4",
    "ended_at": "40:57.1",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "22:45.4",
    "ended_at": "46:19.1",
    "start_station_name": "John McCormack Rd & Michigan Ave NE",
    "start_station_id": "31502",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "43:02.9",
    "ended_at": "51:13.7",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "34:01.0",
    "ended_at": "38:54.8",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "08:08.8",
    "ended_at": "11:54.5",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "39:30.6",
    "ended_at": "00:32.6",
    "start_station_name": "Virginia Ave & C St NW",
    "start_station_id": "31261",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "50:13.3",
    "ended_at": "54:19.3",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "25:42.7",
    "ended_at": "29:12.2",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "07:43.2",
    "ended_at": "16:02.8",
    "start_station_name": "2nd St & Seaton Pl NE",
    "start_station_id": "31522",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "56:46.9",
    "ended_at": "00:44.6",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "37:02.6",
    "ended_at": "47:14.6",
    "start_station_name": "Reservoir Rd & 38th St NW",
    "start_station_id": "31325",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "59:09.0",
    "ended_at": "17:59.9",
    "start_station_name": "24th & R St NE / National Arboretum",
    "start_station_id": "31520",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "15:22.4",
    "ended_at": "30:42.1",
    "start_station_name": "24th & R St NE / National Arboretum",
    "start_station_id": "31520",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "52:58.3",
    "ended_at": "01:01.3",
    "start_station_name": "Columbus Circle / Union Station",
    "start_station_id": "31623",
    "end_station_name": "3rd & K St NW",
    "end_station_id": "33002"
  },
  {
    "started_at": "09:22.9",
    "ended_at": "18:56.0",
    "start_station_name": "Columbus Circle / Union Station",
    "start_station_id": "31623",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "44:01.6",
    "ended_at": "57:45.8",
    "start_station_name": "Columbus Circle / Union Station",
    "start_station_id": "31623",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "37:52.9",
    "ended_at": "52:24.1",
    "start_station_name": "Columbus Circle / Union Station",
    "start_station_id": "31623",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "37:48.2",
    "ended_at": "53:22.2",
    "start_station_name": "Columbus Circle / Union Station",
    "start_station_id": "31623",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "52:36.3",
    "ended_at": "58:29.1",
    "start_station_name": "11th & V St NW",
    "start_station_id": "31332",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "10:09.4",
    "ended_at": "21:07.0",
    "start_station_name": "Columbus Circle / Union Station",
    "start_station_id": "31623",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "40:25.4",
    "ended_at": "53:27.8",
    "start_station_name": "Columbus Circle / Union Station",
    "start_station_id": "31623",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "40:39.8",
    "ended_at": "47:49.1",
    "start_station_name": "19th & Savannah St SE",
    "start_station_id": "31815",
    "end_station_name": "Congress Heights Metro",
    "end_station_id": "31806"
  },
  {
    "started_at": "08:54.5",
    "ended_at": "23:30.9",
    "start_station_name": "Columbus Circle / Union Station",
    "start_station_id": "31623",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "53:35.7",
    "ended_at": "05:06.6",
    "start_station_name": "Columbus Circle / Union Station",
    "start_station_id": "31623",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "11:22.6",
    "ended_at": "22:51.8",
    "start_station_name": "Thomas Jefferson St NW & Water/K St NW",
    "start_station_id": "31293",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "50:45.3",
    "ended_at": "01:22.0",
    "start_station_name": "Lincoln Memorial",
    "start_station_id": "31258",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "35:20.0",
    "ended_at": "41:45.1",
    "start_station_name": "Tanner Park",
    "start_station_id": "31533",
    "end_station_name": "3rd & K St NW",
    "end_station_id": "33002"
  },
  {
    "started_at": "47:09.5",
    "ended_at": "59:16.8",
    "start_station_name": "Lincoln Memorial",
    "start_station_id": "31258",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "57:23.3",
    "ended_at": "08:28.5",
    "start_station_name": "Adams Mill & Columbia Rd NW",
    "start_station_id": "31104",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "08:11.7",
    "ended_at": "18:43.7",
    "start_station_name": "Lincoln Memorial",
    "start_station_id": "31258",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "30:02.9",
    "ended_at": "39:27.7",
    "start_station_name": "Lincoln Memorial",
    "start_station_id": "31258",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "38:29.5",
    "ended_at": "47:56.8",
    "start_station_name": "Lincoln Memorial",
    "start_station_id": "31258",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "44:29.7",
    "ended_at": "55:20.4",
    "start_station_name": "Lincoln Memorial",
    "start_station_id": "31258",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "25:32.9",
    "ended_at": "36:51.6",
    "start_station_name": "Lincoln Memorial",
    "start_station_id": "31258",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "59:14.6",
    "ended_at": "10:07.8",
    "start_station_name": "Lincoln Memorial",
    "start_station_id": "31258",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "00:40.5",
    "ended_at": "12:05.1",
    "start_station_name": "Lincoln Memorial",
    "start_station_id": "31258",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "55:05.1",
    "ended_at": "01:13.2",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "48:59.7",
    "ended_at": "56:33.7",
    "start_station_name": "2nd St & Seaton Pl NE",
    "start_station_id": "31522",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "11:28.7",
    "ended_at": "17:20.7",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "00:20.7",
    "ended_at": "06:31.5",
    "start_station_name": "Potomac Ave & Half St SW",
    "start_station_id": "31648",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "05:44.2",
    "ended_at": "17:24.5",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "52:47.5",
    "ended_at": "04:03.7",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "12:56.2",
    "ended_at": "22:42.2",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "55:11.5",
    "ended_at": "00:08.6",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "04:17.1",
    "ended_at": "26:03.2",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "25:07.6",
    "ended_at": "12:12.0",
    "start_station_name": "Potomac Ave & Half St SW",
    "start_station_id": "31648",
    "end_station_name": "Minnesota Ave Metro/DOES",
    "end_station_id": "31703"
  },
  {
    "started_at": "58:12.5",
    "ended_at": "04:53.9",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "42:05.7",
    "ended_at": "55:25.9",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "02:01.8",
    "ended_at": "05:45.5",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "05:04.6",
    "ended_at": "08:56.3",
    "start_station_name": "21st St & N Pierce St",
    "start_station_id": "31093",
    "end_station_name": "19th St N & Ft Myer Dr",
    "end_station_id": "31014"
  },
  {
    "started_at": "07:57.5",
    "ended_at": "22:43.1",
    "start_station_name": "20th & E St NW",
    "start_station_id": "31204",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "11:47.8",
    "ended_at": "30:11.6",
    "start_station_name": "20th & E St NW",
    "start_station_id": "31204",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "03:33.0",
    "ended_at": "07:57.6",
    "start_station_name": "Potomac Ave & Half St SW",
    "start_station_id": "31648",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "49:18.1",
    "ended_at": "02:48.8",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "06:00.5",
    "ended_at": "16:41.5",
    "start_station_name": "Pentagon City Metro / 12th St & S Hayes St",
    "start_station_id": "31005",
    "end_station_name": "Rolfe St & 9th St S",
    "end_station_id": "31075"
  },
  {
    "started_at": "36:04.1",
    "ended_at": "43:18.1",
    "start_station_name": "Rosedale Rec Center",
    "start_station_id": "31658",
    "end_station_name": "Stadium Armory Metro",
    "end_station_id": "31665"
  },
  {
    "started_at": "37:25.1",
    "ended_at": "46:11.0",
    "start_station_name": "Market Square / King St & Royal St",
    "start_station_id": "31042",
    "end_station_name": "Braddock Rd Metro South",
    "end_station_id": "31969"
  },
  {
    "started_at": "35:17.7",
    "ended_at": "42:50.7",
    "start_station_name": "Rosedale Rec Center",
    "start_station_id": "31658",
    "end_station_name": "Stadium Armory Metro",
    "end_station_id": "31665"
  },
  {
    "started_at": "01:20.6",
    "ended_at": "06:10.4",
    "start_station_name": "Potomac Ave & Half St SW",
    "start_station_id": "31648",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "45:29.7",
    "ended_at": "11:13.3",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "10th St & Constitution Ave NW",
    "end_station_id": "31219"
  },
  {
    "started_at": "22:21.1",
    "ended_at": "34:04.0",
    "start_station_name": "Market Square / King St & Royal St",
    "start_station_id": "31042",
    "end_station_name": "Braddock Rd Metro South",
    "end_station_id": "31969"
  },
  {
    "started_at": "51:43.6",
    "ended_at": "06:59.2",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "3rd & K St NW",
    "end_station_id": "33002"
  },
  {
    "started_at": "21:55.0",
    "ended_at": "26:28.9",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "00:54.5",
    "ended_at": "12:10.0",
    "start_station_name": "Lee Center",
    "start_station_id": "31914",
    "end_station_name": "Braddock Rd Metro South",
    "end_station_id": "31969"
  },
  {
    "started_at": "45:28.0",
    "ended_at": "00:13.8",
    "start_station_name": "M St & Delaware Ave NE",
    "start_station_id": "31627",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "57:19.2",
    "ended_at": "15:31.7",
    "start_station_name": "M St & Delaware Ave NE",
    "start_station_id": "31627",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "49:51.9",
    "ended_at": "58:32.6",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "05:07.3",
    "ended_at": "09:40.7",
    "start_station_name": "Potomac Ave & Half St SW",
    "start_station_id": "31648",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "44:11.0",
    "ended_at": "54:32.5",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "46:07.0",
    "ended_at": "56:33.0",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "03:54.5",
    "ended_at": "17:32.1",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "57:58.6",
    "ended_at": "05:25.7",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "32:18.0",
    "ended_at": "45:08.0",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "47:44.9",
    "ended_at": "54:29.4",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "10:19.3",
    "ended_at": "20:41.7",
    "start_station_name": "Rosedale Rec Center",
    "start_station_id": "31658",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "00:39.4",
    "ended_at": "07:50.1",
    "start_station_name": "Market Square / King St & Royal St",
    "start_station_id": "31042",
    "end_station_name": "Braddock Rd Metro South",
    "end_station_id": "31969"
  },
  {
    "started_at": "17:23.2",
    "ended_at": "23:40.5",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "36:24.8",
    "ended_at": "46:34.4",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "Stadium Armory Metro",
    "end_station_id": "31665"
  },
  {
    "started_at": "07:29.4",
    "ended_at": "09:12.4",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "22:02.2",
    "ended_at": "37:17.8",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "Stadium Armory Metro",
    "end_station_id": "31665"
  },
  {
    "started_at": "56:33.1",
    "ended_at": "08:05.7",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "Stadium Armory Metro",
    "end_station_id": "31665"
  },
  {
    "started_at": "51:41.3",
    "ended_at": "08:35.0",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "New York Ave & Hecht Ave NE",
    "end_station_id": "31518"
  },
  {
    "started_at": "33:26.1",
    "ended_at": "40:03.4",
    "start_station_name": "Howard Rd & Suitland Pkwy SE",
    "start_station_id": "33203",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "44:18.9",
    "ended_at": "54:25.5",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "12:42.3",
    "ended_at": "17:37.2",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "7th & S St NW",
    "end_station_id": "31130"
  },
  {
    "started_at": "54:09.9",
    "ended_at": "36:06.5",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "05:06.9",
    "ended_at": "44:37.4",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "18th & M St NW",
    "end_station_id": "31221"
  },
  {
    "started_at": "31:31.1",
    "ended_at": "42:19.4",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "55:04.0",
    "ended_at": "00:30.1",
    "start_station_name": "Potomac Ave & Half St SW",
    "start_station_id": "31648",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "43:12.8",
    "ended_at": "48:40.9",
    "start_station_name": "Potomac Ave & Half St SW",
    "start_station_id": "31648",
    "end_station_name": "M St & New Jersey Ave SE",
    "end_station_id": "31208"
  },
  {
    "started_at": "29:02.9",
    "ended_at": "35:52.4",
    "start_station_name": "Rosedale Rec Center",
    "start_station_id": "31658",
    "end_station_name": "Stadium Armory Metro",
    "end_station_id": "31665"
  },
  {
    "started_at": "20:20.0",
    "ended_at": "27:36.0",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "18th & New Hampshire Ave NW",
    "end_station_id": "31324"
  },
  {
    "started_at": "27:59.5",
    "ended_at": "33:53.3",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "3rd & K St NW",
    "end_station_id": "33002"
  },
  {
    "started_at": "06:27.0",
    "ended_at": "18:34.1",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "Stadium Armory Metro",
    "end_station_id": "31665"
  },
  {
    "started_at": "10:10.5",
    "ended_at": "11:37.3",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "8th & O St NW",
    "end_station_id": "31281"
  },
  {
    "started_at": "20:20.6",
    "ended_at": "31:57.1",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "19:56.3",
    "ended_at": "41:34.7",
    "start_station_name": "Virginia Ave & C St NW",
    "start_station_id": "31261",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "20:54.9",
    "ended_at": "24:40.4",
    "start_station_name": "11th & O St NW",
    "start_station_id": "31286",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "39:48.5",
    "ended_at": "50:35.0",
    "start_station_name": "N Veitch St & Key Blvd",
    "start_station_id": "31028",
    "end_station_name": "Rosslyn Metro / Wilson Blvd & N Moore St",
    "end_station_id": "31947"
  },
  {
    "started_at": "34:56.3",
    "ended_at": "43:01.9",
    "start_station_name": "New Hampshire Ave & T St NW",
    "start_station_id": "31229",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "51:24.2",
    "ended_at": "56:26.8",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "3rd & Elm St NW",
    "end_station_id": "31118"
  },
  {
    "started_at": "32:17.5",
    "ended_at": "07:39.2",
    "start_station_name": "Columbia Pike & W&OD Trail ",
    "start_station_id": "31981",
    "end_station_name": "Rosslyn Metro / Wilson Blvd & N Moore St",
    "end_station_id": "31947"
  },
  {
    "started_at": "42:34.9",
    "ended_at": "50:01.5",
    "start_station_name": "Georgia & Missouri Ave NW",
    "start_station_id": "31411",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "09:16.6",
    "ended_at": "18:45.3",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "23:36.3",
    "ended_at": "27:55.3",
    "start_station_name": "10th & K St NW",
    "start_station_id": "31263",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "49:26.9",
    "ended_at": "55:46.9",
    "start_station_name": "10th St & Florida Ave NW",
    "start_station_id": "31120",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "13:30.5",
    "ended_at": "29:00.4",
    "start_station_name": "2nd St & Seaton Pl NE",
    "start_station_id": "31522",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "06:07.7",
    "ended_at": "17:54.8",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "41:20.2",
    "ended_at": "48:51.0",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "45:34.0",
    "ended_at": "54:37.7",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "3rd & Elm St NW",
    "end_station_id": "31118"
  },
  {
    "started_at": "18:41.3",
    "ended_at": "23:55.6",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "02:09.1",
    "ended_at": "08:48.9",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "37:35.6",
    "ended_at": "43:43.4",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "09:37.5",
    "ended_at": "14:58.6",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "02:24.4",
    "ended_at": "10:51.5",
    "start_station_name": "2nd St & Seaton Pl NE",
    "start_station_id": "31522",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "53:16.0",
    "ended_at": "04:34.5",
    "start_station_name": "2nd St & Seaton Pl NE",
    "start_station_id": "31522",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "33:26.7",
    "ended_at": "38:51.2",
    "start_station_name": "Kansas Ave & Blair Rd NW",
    "start_station_id": "33201",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "46:24.0",
    "ended_at": "51:02.2",
    "start_station_name": "Kansas Ave & Blair Rd NW",
    "start_station_id": "33201",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "18:08.9",
    "ended_at": "22:02.4",
    "start_station_name": "Kansas Ave & Blair Rd NW",
    "start_station_id": "33201",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "15:18.9",
    "ended_at": "20:51.4",
    "start_station_name": "Kansas Ave & Blair Rd NW",
    "start_station_id": "33201",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "37:05.4",
    "ended_at": "45:32.4",
    "start_station_name": "Lincoln Rd & Seaton Pl NE/Harry Thomas Rec Center",
    "start_station_id": "31523",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "39:59.0",
    "ended_at": "46:08.9",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "Rosslyn Metro / Wilson Blvd & N Moore St",
    "end_station_id": "31947"
  },
  {
    "started_at": "47:10.8",
    "ended_at": "01:29.4",
    "start_station_name": "North Capitol St & G Pl NE",
    "start_station_id": "31637",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "26:05.4",
    "ended_at": "41:19.7",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "Rosslyn Metro / Wilson Blvd & N Moore St",
    "end_station_id": "31947"
  },
  {
    "started_at": "10:33.6",
    "ended_at": "16:36.2",
    "start_station_name": "Columbia Rd & Georgia Ave NW",
    "start_station_id": "31115",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "08:12.9",
    "ended_at": "13:07.7",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "59:15.2",
    "ended_at": "03:28.6",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "37:02.0",
    "ended_at": "42:14.7",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "02:15.0",
    "ended_at": "07:11.9",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "13:04.2",
    "ended_at": "16:48.1",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "56:55.1",
    "ended_at": "05:24.5",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "47:03.0",
    "ended_at": "03:07.2",
    "start_station_name": "Kansas Ave & Blair Rd NW",
    "start_station_id": "33201",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "45:28.5",
    "ended_at": "53:02.2",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "48:45.4",
    "ended_at": "12:08.8",
    "start_station_name": "8th & East Capitol St NE",
    "start_station_id": "31629",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "27:36.7",
    "ended_at": "41:56.7",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "16:39.2",
    "ended_at": "25:21.4",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "34:50.1",
    "ended_at": "39:45.3",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "Rosslyn Metro / Wilson Blvd & N Moore St",
    "end_station_id": "31947"
  },
  {
    "started_at": "20:04.3",
    "ended_at": "33:35.0",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "19:31.8",
    "ended_at": "28:08.8",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "52:48.5",
    "ended_at": "54:19.3",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "36:15.2",
    "ended_at": "46:05.4",
    "start_station_name": "Pimmit Dr & Idyl Ln",
    "start_station_id": "32264",
    "end_station_name": "Rosslyn Metro / Wilson Blvd & N Moore St",
    "end_station_id": "31947"
  },
  {
    "started_at": "49:49.4",
    "ended_at": "04:10.1",
    "start_station_name": "Wisconsin Ave & Rodman St NW",
    "start_station_id": "31333",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "14:52.1",
    "ended_at": "20:56.9",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "10:40.1",
    "ended_at": "18:50.5",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "25:21.7",
    "ended_at": "33:07.6",
    "start_station_name": "Langston Blvd & N Adams St",
    "start_station_id": "31030",
    "end_station_name": "Rosslyn Metro / Wilson Blvd & N Moore St",
    "end_station_id": "31947"
  },
  {
    "started_at": "57:57.5",
    "ended_at": "10:44.5",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "02:54.5",
    "ended_at": "09:12.2",
    "start_station_name": "14th & Girard St NW",
    "start_station_id": "31123",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "49:54.0",
    "ended_at": "55:50.1",
    "start_station_name": "14th & Girard St NW",
    "start_station_id": "31123",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "41:20.0",
    "ended_at": "48:10.5",
    "start_station_name": "Kansas Ave & Blair Rd NW",
    "start_station_id": "33201",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "57:14.2",
    "ended_at": "02:37.9",
    "start_station_name": "Kansas Ave & Blair Rd NW",
    "start_station_id": "33201",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "08:40.3",
    "ended_at": "15:52.6",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "31:43.3",
    "ended_at": "37:20.4",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "41:47.3",
    "ended_at": "59:59.5",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "14th & R St NW",
    "end_station_id": "31202"
  },
  {
    "started_at": "51:48.4",
    "ended_at": "12:29.8",
    "start_station_name": "Georgia Ave & Dahlia St NW",
    "start_station_id": "31425",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "40:50.3",
    "ended_at": "57:18.1",
    "start_station_name": "Georgia & Missouri Ave NW",
    "start_station_id": "31411",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "49:59.5",
    "ended_at": "59:10.9",
    "start_station_name": "Georgia & Missouri Ave NW",
    "start_station_id": "31411",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "15:32.7",
    "ended_at": "20:15.6",
    "start_station_name": "Columbia Pike & W&OD Trail ",
    "start_station_id": "31981",
    "end_station_name": "Barcroft Community Center",
    "end_station_id": "31033"
  },
  {
    "started_at": "36:53.0",
    "ended_at": "04:13.7",
    "start_station_name": "8th & K St NE",
    "start_station_id": "31660",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "57:58.0",
    "ended_at": "06:19.4",
    "start_station_name": "Georgia & Missouri Ave NW",
    "start_station_id": "31411",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "57:05.3",
    "ended_at": "01:32.4",
    "start_station_name": "Woodley Park Metro / Calvert St & Connecticut Ave NW",
    "start_station_id": "31323",
    "end_station_name": "3000 Connecticut Ave NW / National Zoo",
    "end_station_id": "31307"
  },
  {
    "started_at": "10:18.3",
    "ended_at": "30:44.4",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "13:56.5",
    "ended_at": "34:22.7",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "13:44.5",
    "ended_at": "34:16.3",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "44:19.2",
    "ended_at": "50:48.1",
    "start_station_name": "Barton St & 10th St N",
    "start_station_id": "31050",
    "end_station_name": "Rosslyn Metro / Wilson Blvd & N Moore St",
    "end_station_id": "31947"
  },
  {
    "started_at": "59:01.0",
    "ended_at": "03:20.6",
    "start_station_name": "Woodley Park Metro / Calvert St & Connecticut Ave NW",
    "start_station_id": "31323",
    "end_station_name": "3000 Connecticut Ave NW / National Zoo",
    "end_station_id": "31307"
  },
  {
    "started_at": "37:21.4",
    "ended_at": "46:52.2",
    "start_station_name": "1st & L St NW",
    "start_station_id": "31677",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "06:48.5",
    "ended_at": "20:56.6",
    "start_station_name": "Wisconsin Ave & Upton St NW",
    "start_station_id": "31393",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "59:48.2",
    "ended_at": "03:56.1",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "21:04.9",
    "ended_at": "25:36.3",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "20:46.2",
    "ended_at": "31:20.0",
    "start_station_name": "1st & L St NW",
    "start_station_id": "31677",
    "end_station_name": "Thomas Circle",
    "end_station_id": "31241"
  },
  {
    "started_at": "29:36.9",
    "ended_at": "44:18.7",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "06:25.3",
    "ended_at": "12:33.0",
    "start_station_name": "Lamont & Mt Pleasant NW",
    "start_station_id": "31107",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "24:36.4",
    "ended_at": "40:17.4",
    "start_station_name": "Reservoir Rd & 38th St NW",
    "start_station_id": "31325",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "59:13.8",
    "ended_at": "24:23.2",
    "start_station_name": "Lamont & Mt Pleasant NW",
    "start_station_id": "31107",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "59:21.5",
    "ended_at": "23:54.6",
    "start_station_name": "Lamont & Mt Pleasant NW",
    "start_station_id": "31107",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "53:51.3",
    "ended_at": "03:08.5",
    "start_station_name": "Lamont & Mt Pleasant NW",
    "start_station_id": "31107",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "41:38.4",
    "ended_at": "00:33.9",
    "start_station_name": "Reservoir Rd & 38th St NW",
    "start_station_id": "31325",
    "end_station_name": "14th & V St NW",
    "end_station_id": "31101"
  },
  {
    "started_at": "25:39.9",
    "ended_at": "35:31.2",
    "start_station_name": "Lamont & Mt Pleasant NW",
    "start_station_id": "31107",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "56:27.8",
    "ended_at": "06:06.1",
    "start_station_name": "Lamont & Mt Pleasant NW",
    "start_station_id": "31107",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "15:02.0",
    "ended_at": "20:55.1",
    "start_station_name": "9th & Ingraham St NW",
    "start_station_id": "31424",
    "end_station_name": "Fort Totten Metro",
    "end_station_id": "31515"
  },
  {
    "started_at": "39:00.5",
    "ended_at": "47:45.8",
    "start_station_name": "Adams Mill & Columbia Rd NW",
    "start_station_id": "31104",
    "end_station_name": "9th & Upshur St NW",
    "end_station_id": "31404"
  },
  {
    "started_at": "31:46.7",
    "ended_at": "40:26.9",
    "start_station_name": "Thomas Jefferson St NW & Water/K St NW",
    "start_station_id": "31293",
    "end_station_name": "14th & Q St NW",
    "end_station_id": "31327"
  },
  {
    "started_at": "23:32.5",
    "ended_at": "30:39.9",
    "start_station_name": "16th & Harvard St NW",
    "start_station_id": "31135",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "36:05.6",
    "ended_at": "38:30.6",
    "start_station_name": "Virginia Ave & C St NW",
    "start_station_id": "31261",
    "end_station_name": "Virginia Ave & C St NW",
    "end_station_id": "31261"
  },
  {
    "started_at": "39:11.8",
    "ended_at": "47:49.3",
    "start_station_name": "Virginia Ave & C St NW",
    "start_station_id": "31261",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "39:32.2",
    "ended_at": "31:01.1",
    "start_station_name": "20th & E St NW",
    "start_station_id": "31204",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "03:52.2",
    "ended_at": "13:58.4",
    "start_station_name": "King Greenleaf Rec Center",
    "start_station_id": "31654",
    "end_station_name": "King Greenleaf Rec Center",
    "end_station_id": "31654"
  },
  {
    "started_at": "16:28.9",
    "ended_at": "31:24.8",
    "start_station_name": "Route 29 & Bisvey Dr",
    "start_station_id": "32267",
    "end_station_name": "Route 29 & Bisvey Dr",
    "end_station_id": "32267"
  },
  {
    "started_at": "16:27.6",
    "ended_at": "31:22.1",
    "start_station_name": "Route 29 & Bisvey Dr",
    "start_station_id": "32267",
    "end_station_name": "Route 29 & Bisvey Dr",
    "end_station_id": "32267"
  },
  {
    "started_at": "30:35.5",
    "ended_at": "42:57.2",
    "start_station_name": "King Greenleaf Rec Center",
    "start_station_id": "31654",
    "end_station_name": "King Greenleaf Rec Center",
    "end_station_id": "31654"
  },
  {
    "started_at": "11:03.5",
    "ended_at": "16:55.8",
    "start_station_name": "Fairfax Village",
    "start_station_id": "31706",
    "end_station_name": "Marion Barry Ave & Naylor Rd SE",
    "end_station_id": "31700"
  },
  {
    "started_at": "16:21.6",
    "ended_at": "16:38.6",
    "start_station_name": "Fenton St & New York Ave ",
    "start_station_id": "32001",
    "end_station_name": "Fenton St & New York Ave ",
    "end_station_id": "32001"
  },
  {
    "started_at": "51:15.5",
    "ended_at": "07:07.8",
    "start_station_name": "Wiehle-Reston Metro North",
    "start_station_id": "32215",
    "end_station_name": "Wiehle-Reston Metro North",
    "end_station_id": "32215"
  },
  {
    "started_at": "49:56.3",
    "ended_at": "02:22.3",
    "start_station_name": "20th & E St NW",
    "start_station_id": "31204",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "05:44.1",
    "ended_at": "15:57.8",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "59:30.0",
    "ended_at": "04:00.1",
    "start_station_name": "Wilson Blvd & N Quinn St",
    "start_station_id": "31027",
    "end_station_name": "21st St & N Pierce St",
    "end_station_id": "31093"
  },
  {
    "started_at": "23:39.7",
    "ended_at": "26:13.3",
    "start_station_name": "Wilson Blvd & N Quinn St",
    "start_station_id": "31027",
    "end_station_name": "21st St & N Pierce St",
    "end_station_id": "31093"
  },
  {
    "started_at": "03:21.7",
    "ended_at": "08:00.1",
    "start_station_name": "20th & L St NW",
    "start_station_id": "31250",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "59:46.9",
    "ended_at": "05:51.8",
    "start_station_name": "25th St & Pennsylvania Ave NW",
    "start_station_id": "31237",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "44:46.8",
    "ended_at": "50:07.8",
    "start_station_name": "19th & East Capitol St SE",
    "start_station_id": "31601",
    "end_station_name": "Anacostia Ave & East Capitol St NE",
    "end_station_id": "31721"
  },
  {
    "started_at": "34:28.5",
    "ended_at": "42:40.4",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "50:39.6",
    "ended_at": "13:49.7",
    "start_station_name": "15th & F St NE",
    "start_station_id": "31632",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "59:58.2",
    "ended_at": "04:33.3",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "52:35.5",
    "ended_at": "55:53.3",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "20:50.1",
    "ended_at": "30:28.6",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "33:26.4",
    "ended_at": "40:50.3",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "King Greenleaf Rec Center",
    "end_station_id": "31654"
  },
  {
    "started_at": "57:22.7",
    "ended_at": "01:04.0",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "13:49.7",
    "ended_at": "43:09.7",
    "start_station_name": "18th & Upshur St NE",
    "start_station_id": "31545",
    "end_station_name": "John McCormack Rd & Michigan Ave NE",
    "end_station_id": "31502"
  },
  {
    "started_at": "42:47.9",
    "ended_at": "51:09.1",
    "start_station_name": "Carroll & Westmoreland Ave",
    "start_station_id": "32025",
    "end_station_name": "Fenton St & New York Ave ",
    "end_station_id": "32001"
  },
  {
    "started_at": "00:53.5",
    "ended_at": "15:02.1",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "17th St & Potomac Ave SE / Congressional Cemetery ",
    "end_station_id": "31727"
  },
  {
    "started_at": "01:43.2",
    "ended_at": "13:06.7",
    "start_station_name": "4th & College St NW",
    "start_station_id": "31138",
    "end_station_name": "John McCormack Rd & Michigan Ave NE",
    "end_station_id": "31502"
  },
  {
    "started_at": "49:15.3",
    "ended_at": "57:33.4",
    "start_station_name": "18th & C St NW",
    "start_station_id": "31284",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "48:21.4",
    "ended_at": "56:39.8",
    "start_station_name": "18th & C St NW",
    "start_station_id": "31284",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "45:22.8",
    "ended_at": "52:53.0",
    "start_station_name": "Deanwood Rec Center",
    "start_station_id": "31711",
    "end_station_name": "Kenilworth Terr & Hayes St. NE",
    "end_station_id": "31717"
  },
  {
    "started_at": "14:52.0",
    "ended_at": "28:39.3",
    "start_station_name": "7th St & Massachusetts Ave NE",
    "start_station_id": "31647",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "07:54.2",
    "ended_at": "15:43.0",
    "start_station_name": "Reservoir Rd & 38th St NW",
    "start_station_id": "31325",
    "end_station_name": "21st St & N Pierce St",
    "end_station_id": "31093"
  },
  {
    "started_at": "11:51.8",
    "ended_at": "22:00.5",
    "start_station_name": "Fairfax Dr & N Randolph St",
    "start_station_id": "31034",
    "end_station_name": "Washington Blvd & Walter Reed Dr ",
    "end_station_id": "31073"
  },
  {
    "started_at": "01:24.8",
    "ended_at": "14:18.0",
    "start_station_name": "Fairfax Dr & N Randolph St",
    "start_station_id": "31034",
    "end_station_name": "Washington Blvd & Walter Reed Dr ",
    "end_station_id": "31073"
  },
  {
    "started_at": "45:14.9",
    "ended_at": "49:00.1",
    "start_station_name": "N Veitch St & Key Blvd",
    "start_station_id": "31028",
    "end_station_name": "21st St & N Pierce St",
    "end_station_id": "31093"
  },
  {
    "started_at": "35:06.1",
    "ended_at": "40:49.6",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "20th & E St NW",
    "end_station_id": "31204"
  },
  {
    "started_at": "35:11.7",
    "ended_at": "42:05.8",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "17th & K St NW / Farragut Square",
    "end_station_id": "31233"
  },
  {
    "started_at": "46:56.7",
    "ended_at": "56:02.0",
    "start_station_name": "Clarendon Blvd & N Fillmore St",
    "start_station_id": "31021",
    "end_station_name": "Washington Blvd & Walter Reed Dr ",
    "end_station_id": "31073"
  },
  {
    "started_at": "31:41.0",
    "ended_at": "41:12.0",
    "start_station_name": "Clarendon Blvd & N Fillmore St",
    "start_station_id": "31021",
    "end_station_name": "Washington Blvd & Walter Reed Dr ",
    "end_station_id": "31073"
  },
  {
    "started_at": "22:57.0",
    "ended_at": "55:03.8",
    "start_station_name": "Georgia Ave & Fairmont St NW",
    "start_station_id": "31207",
    "end_station_name": "Kenilworth Terr & Hayes St. NE",
    "end_station_id": "31717"
  },
  {
    "started_at": "15:04.5",
    "ended_at": "23:21.6",
    "start_station_name": "3rd & G St SE",
    "start_station_id": "31625",
    "end_station_name": "17th St & Potomac Ave SE / Congressional Cemetery ",
    "end_station_id": "31727"
  },
  {
    "started_at": "01:46.0",
    "ended_at": "09:26.0",
    "start_station_name": "8th & Eye St SE / Barracks Row",
    "start_station_id": "31608",
    "end_station_name": "1st & M St SE",
    "end_station_id": "31650"
  },
  {
    "started_at": "30:15.6",
    "ended_at": "42:50.6",
    "start_station_name": "20th & L St NW",
    "start_station_id": "31250",
    "end_station_name": "Woodley Park Metro / Calvert St & Connecticut Ave NW",
    "end_station_id": "31323"
  },
  {
    "started_at": "31:42.2",
    "ended_at": "40:35.1",
    "start_station_name": "Maine Ave & 7th St SW",
    "start_station_id": "31609",
    "end_station_name": "8th & Eye St SE / Barracks Row",
    "end_station_id": "31608"
  },
  {
    "started_at": "03:59.8",
    "ended_at": "13:20.7",
    "start_station_name": "Maine Ave & 7th St SW",
    "start_station_id": "31609",
    "end_station_name": "8th & Eye St SE / Barracks Row",
    "end_station_id": "31608"
  },
  {
    "started_at": "12:22.0",
    "ended_at": "26:37.3",
    "start_station_name": "Neal St & Trinidad Ave NE",
    "start_station_id": "31512",
    "end_station_name": "8th & Eye St SE / Barracks Row",
    "end_station_id": "31608"
  },
  {
    "started_at": "19:11.6",
    "ended_at": "19:14.8",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "34th St & Wisconsin Ave NW",
    "end_station_id": "31226"
  },
  {
    "started_at": "19:48.1",
    "ended_at": "21:27.5",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "34th St & Wisconsin Ave NW",
    "end_station_id": "31226"
  },
  {
    "started_at": "53:53.9",
    "ended_at": "57:25.9",
    "start_station_name": "28th St & S Meade St",
    "start_station_id": "31055",
    "end_station_name": "28th St & S Meade St",
    "end_station_id": "31055"
  },
  {
    "started_at": "03:10.9",
    "ended_at": "15:53.4",
    "start_station_name": "Half & I St SW ",
    "start_station_id": "31680",
    "end_station_name": "Half & I St SW ",
    "end_station_id": "31680"
  },
  {
    "started_at": "39:21.2",
    "ended_at": "50:30.3",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "22nd & I St NW / Foggy Bottom",
    "end_station_id": "31257"
  },
  {
    "started_at": "55:26.1",
    "ended_at": "59:06.9",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "15th & P St NW",
    "end_station_id": "31201"
  },
  {
    "started_at": "46:09.0",
    "ended_at": "51:41.7",
    "start_station_name": "Vermont Ave & I St NW",
    "start_station_id": "31291",
    "end_station_name": "15th & P St NW",
    "end_station_id": "31201"
  },
  {
    "started_at": "27:16.4",
    "ended_at": "46:20.3",
    "start_station_name": "Pentagon City Metro / 12th St & S Hayes St",
    "start_station_id": "31005",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "02:18.3",
    "ended_at": "16:39.2",
    "start_station_name": "Wisconsin Ave & Upton St NW",
    "start_station_id": "31393",
    "end_station_name": "Lamont & Mt Pleasant NW",
    "end_station_id": "31107"
  },
  {
    "started_at": "03:14.4",
    "ended_at": "08:22.8",
    "start_station_name": "Woodley Park Metro / Calvert St & Connecticut Ave NW",
    "start_station_id": "31323",
    "end_station_name": "Lamont & Mt Pleasant NW",
    "end_station_id": "31107"
  },
  {
    "started_at": "29:00.8",
    "ended_at": "31:40.6",
    "start_station_name": "34th St & Wisconsin Ave NW",
    "start_station_id": "31226",
    "end_station_name": "Reservoir Rd & 38th St NW",
    "end_station_id": "31325"
  },
  {
    "started_at": "18:59.4",
    "ended_at": "29:07.4",
    "start_station_name": "22nd & I St NW / Foggy Bottom",
    "start_station_id": "31257",
    "end_station_name": "Reservoir Rd & 38th St NW",
    "end_station_id": "31325"
  },
  {
    "started_at": "28:23.8",
    "ended_at": "39:20.2",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "11th & V St NW",
    "end_station_id": "31332"
  },
  {
    "started_at": "33:47.2",
    "ended_at": "40:04.8",
    "start_station_name": "15th & F St NE",
    "start_station_id": "31632",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "14:30.0",
    "ended_at": "22:59.1",
    "start_station_name": "Columbia & Ontario Rd NW",
    "start_station_id": "31296",
    "end_station_name": "Lamont & Mt Pleasant NW",
    "end_station_id": "31107"
  },
  {
    "started_at": "42:39.5",
    "ended_at": "48:05.8",
    "start_station_name": "3rd & D St SE",
    "start_station_id": "31605",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "04:25.8",
    "ended_at": "10:28.8",
    "start_station_name": "3rd & D St SE",
    "start_station_id": "31605",
    "end_station_name": "7th St & Massachusetts Ave NE",
    "end_station_id": "31647"
  },
  {
    "started_at": "21:51.3",
    "ended_at": "25:30.9",
    "start_station_name": "Massachusetts Ave & 6th St NE",
    "start_station_id": "31657",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "45:46.5",
    "ended_at": "59:48.7",
    "start_station_name": "16th & R St NW",
    "start_station_id": "31282",
    "end_station_name": "Reservoir Rd & 38th St NW",
    "end_station_id": "31325"
  },
  {
    "started_at": "55:01.9",
    "ended_at": "00:48.2",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "11th & V St NW",
    "end_station_id": "31332"
  },
  {
    "started_at": "12:14.2",
    "ended_at": "18:27.8",
    "start_station_name": "8th & K St NE",
    "start_station_id": "31660",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "12:11.5",
    "ended_at": "21:38.7",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "Lamont & Mt Pleasant NW",
    "end_station_id": "31107"
  },
  {
    "started_at": "07:27.7",
    "ended_at": "15:02.1",
    "start_station_name": "S Randolph St & Campbell Ave",
    "start_station_id": "31076",
    "end_station_name": "King St & W Braddock Rd",
    "end_station_id": "31962"
  },
  {
    "started_at": "13:24.4",
    "ended_at": "15:37.5",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "24:51.6",
    "ended_at": "55:51.7",
    "start_station_name": "Virginia Ave & C St NW",
    "start_station_id": "31261",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "19:57.8",
    "ended_at": "31:31.9",
    "start_station_name": "1st & I St SE",
    "start_station_id": "31628",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "39:17.5",
    "ended_at": "42:34.4",
    "start_station_name": "14th & Newton St NW",
    "start_station_id": "31649",
    "end_station_name": "Lamont & Mt Pleasant NW",
    "end_station_id": "31107"
  },
  {
    "started_at": "44:15.4",
    "ended_at": "53:00.0",
    "start_station_name": "9th & N St NW ",
    "start_station_id": "31336",
    "end_station_name": "11th & V St NW",
    "end_station_id": "31332"
  },
  {
    "started_at": "09:41.2",
    "ended_at": "33:18.5",
    "start_station_name": "18th & C St NW",
    "start_station_id": "31284",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "35:05.9",
    "ended_at": "37:58.9",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "7th St & Massachusetts Ave NE",
    "end_station_id": "31647"
  },
  {
    "started_at": "37:24.1",
    "ended_at": "48:16.6",
    "start_station_name": "18th & C St NW",
    "start_station_id": "31284",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "35:41.7",
    "ended_at": "47:24.0",
    "start_station_name": "18th & C St NW",
    "start_station_id": "31284",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "37:25.9",
    "ended_at": "48:12.7",
    "start_station_name": "18th & C St NW",
    "start_station_id": "31284",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "35:27.2",
    "ended_at": "45:25.6",
    "start_station_name": "18th & C St NW",
    "start_station_id": "31284",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "08:36.6",
    "ended_at": "22:08.2",
    "start_station_name": "2nd St & Massachusetts Ave NE",
    "start_station_id": "31641",
    "end_station_name": "Lamont & Mt Pleasant NW",
    "end_station_id": "31107"
  },
  {
    "started_at": "28:28.1",
    "ended_at": "43:11.4",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Reservoir Rd & 38th St NW",
    "end_station_id": "31325"
  },
  {
    "started_at": "06:35.0",
    "ended_at": "19:50.5",
    "start_station_name": "15th & P St NW",
    "start_station_id": "31201",
    "end_station_name": "Lamont & Mt Pleasant NW",
    "end_station_id": "31107"
  },
  {
    "started_at": "44:27.9",
    "ended_at": "55:53.0",
    "start_station_name": "Van Dorn Metro",
    "start_station_id": "31932",
    "end_station_name": "Brenman Park Dr & Somervelle St",
    "end_station_id": "31001"
  },
  {
    "started_at": "16:52.5",
    "ended_at": "42:29.7",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "Lamont & Mt Pleasant NW",
    "end_station_id": "31107"
  },
  {
    "started_at": "06:22.1",
    "ended_at": "21:52.3",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "Lincoln Park / 13th & East Capitol St NE ",
    "end_station_id": " "
  },
  {
    "started_at": "12:51.3",
    "ended_at": "44:09.4",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "Lamont & Mt Pleasant NW",
    "end_station_id": "31107"
  },
  {
    "started_at": "31:17.1",
    "ended_at": "39:07.1",
    "start_station_name": "17th & K St NW / Farragut Square",
    "start_station_id": "31233",
    "end_station_name": "11th & V St NW",
    "end_station_id": "31332"
  },
  {
    "started_at": "55:53.1",
    "ended_at": "15:40.8",
    "start_station_name": "Virginia Ave & C St NW",
    "start_station_id": "31261",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "38:09.5",
    "ended_at": "41:00.6",
    "start_station_name": "10th St & Florida Ave NW",
    "start_station_id": "31120",
    "end_station_name": "11th & V St NW",
    "end_station_id": "31332"
  },
  {
    "started_at": "51:01.4",
    "ended_at": "02:15.8",
    "start_station_name": "Bladensburg Rd & Benning Rd NE",
    "start_station_id": "31617",
    "end_station_name": "Columbus Circle / Union Station",
    "end_station_id": "31623"
  },
  {
    "started_at": "37:22.4",
    "ended_at": "45:39.9",
    "start_station_name": "King St Metro North / Cameron St",
    "start_station_id": "31098",
    "end_station_name": "Witter Field",
    "end_station_id": "32101"
  },
  {
    "started_at": "35:52.4",
    "ended_at": "45:33.7",
    "start_station_name": "20th & L St NW",
    "start_station_id": "31250",
    "end_station_name": "Reservoir Rd & 38th St NW",
    "end_station_id": "31325"
  },
  {
    "started_at": "47:58.3",
    "ended_at": "54:02.7",
    "start_station_name": "25th St & Pennsylvania Ave NW",
    "start_station_id": "31237",
    "end_station_name": "Reservoir Rd & 38th St NW",
    "end_station_id": "31325"
  },
];