// 2026 NFL Draft rookie class — skill positions only
// Update each year after the draft. Names must match Fantrax display names (First Last).
// Matching is case-insensitive and partial-match tolerant.

export interface RookieEntry { name: string; team: string }

export const ROOKIE_CLASS: RookieEntry[] = [
  // ── QBs ────────────────────────────────────────────────────────────────────
  { name: 'Fernando Mendoza',    team: 'LV'  },  // R1P1
  { name: 'Ty Simpson',          team: 'LAR' },  // R1P13
  { name: 'Carson Beck',         team: 'ARI' },  // R3P65
  { name: 'Drew Allar',          team: 'PIT' },  // R3P76
  { name: 'Cade Klubnik',        team: 'NYJ' },  // R4P110
  { name: 'Cole Payton',         team: 'PHI' },  // R5P178
  { name: 'Taylen Green',        team: 'CLE' },  // R6P182
  { name: 'Athan Kaliakmanis',   team: 'WAS' },  // R7P223
  { name: 'Behren Morton',       team: 'NE'  },  // R7P234
  { name: 'Garrett Nussmeier',   team: 'KC'  },  // R7P249

  // ── RBs ────────────────────────────────────────────────────────────────────
  { name: 'Jeremiyah Love',      team: 'ARI' },  // R1P3
  { name: 'Jadarian Price',      team: 'SEA' },  // R1P32
  { name: 'Kaelon Black',        team: 'SF'  },  // R3P90
  { name: 'Jonah Coleman',       team: 'DEN' },  // R4P108
  { name: 'Mike Washington',     team: 'LV'  },  // R4P122
  { name: 'Emmett Johnson',      team: 'KC'  },  // R5P161
  { name: 'Nicholas Singleton',  team: 'TEN' },  // R5P165
  { name: 'Adam Randall',        team: 'BAL' },  // R5P174
  { name: 'Kaytron Allen',       team: 'WAS' },  // R6P187
  { name: 'Demond Claiborne',    team: 'MIN' },  // R6P198
  { name: 'Eli Heidenreich',     team: 'PIT' },  // R7P230
  { name: 'Seth McGowan',        team: 'IND' },  // R7P237
  { name: 'Jam Miller',          team: 'NE'  },  // R7P245

  // ── WRs ────────────────────────────────────────────────────────────────────
  { name: 'Carnell Tate',        team: 'TEN' },  // R1P4
  { name: 'Jordyn Tyson',        team: 'NO'  },  // R1P8
  { name: 'Makai Lemon',         team: 'PHI' },  // R1P20
  { name: 'KC Concepcion',       team: 'CLE' },  // R1P24
  { name: 'Omar Cooper',         team: 'NYJ' },  // R1P30
  { name: "De'Zhaun Stribling",  team: 'SF'  },  // R2P33
  { name: 'Denzel Boston',       team: 'CLE' },  // R2P39
  { name: 'Germie Bernard',      team: 'PIT' },  // R2P47
  { name: 'Antonio Williams',    team: 'WAS' },  // R3P71
  { name: 'Malachi Fields',      team: 'NYG' },  // R3P74
  { name: 'Caleb Douglas',       team: 'MIA' },  // R3P75
  { name: 'Zachariah Branch',    team: 'ATL' },  // R3P79
  { name: "Ja'Kobi Lane",        team: 'BAL' },  // R3P80
  { name: 'Chris Brazzell',      team: 'CAR' },  // R3P83
  { name: 'Ted Hurst',           team: 'TB'  },  // R3P84
  { name: 'Zavion Thomas',       team: 'CHI' },  // R3P89
  { name: 'Chris Bell',          team: 'MIA' },  // R3P94
  { name: 'Brenen Thompson',     team: 'LAC' },  // R4P105
  { name: 'Elijah Sarratt',      team: 'BAL' },  // R4P115
  { name: 'Kaden Wetjen',        team: 'PIT' },  // R4P121
  { name: 'Skyler Bell',         team: 'BUF' },  // R4P125
  { name: 'Bryce Lance',         team: 'NO'  },  // R4P136
  { name: 'Colbie Young',        team: 'CIN' },  // R4P140
  { name: 'Reggie Virgil',       team: 'ARI' },  // R5P143
  { name: 'Kendrick Law',        team: 'DET' },  // R5P168
  { name: 'Cyrus Allen',         team: 'KC'  },  // R5P176
  { name: 'Kevin Coleman',       team: 'MIA' },  // R5P177
  { name: 'Barion Brown',        team: 'NO'  },  // R6P190
  { name: 'Josh Cameron',        team: 'JAX' },  // R6P191
  { name: 'Malik Benson',        team: 'LV'  },  // R6P195
  { name: 'CJ Daniels',          team: 'LAR' },  // R6P197
  { name: 'Emmanuel Henderson',  team: 'SEA' },  // R6P199
  { name: 'CJ Williams',         team: 'JAX' },  // R6P203
  { name: 'Lewis Bond',          team: 'HOU' },  // R6P204
  { name: 'Anthony Smith',       team: 'DAL' },  // R7P218
  { name: 'Deion Burks',         team: 'IND' },  // R7P254

  // ── TEs ────────────────────────────────────────────────────────────────────
  { name: 'Kenyon Sadiq',        team: 'NYJ' },  // R1P16
  { name: 'Eli Stowers',         team: 'PHI' },  // R2P54
  { name: 'Nate Boerkircher',    team: 'JAX' },  // R2P56
  { name: 'Marlin Klein',        team: 'HOU' },  // R2P59
  { name: 'Max Klare',           team: 'LAR' },  // R2P61
  { name: 'Sam Roush',           team: 'CHI' },  // R3P69
  { name: 'Oscar Delp',          team: 'NO'  },  // R3P73
  { name: 'Will Kacmarek',       team: 'MIA' },  // R3P87
  { name: 'Eli Raridon',         team: 'NE'  },  // R3P95
  { name: 'Matthew Hibner',      team: 'BAL' },  // R4P133
  { name: 'Tanner Koziol',       team: 'JAX' },  // R5P164
  { name: 'Riley Nowakowski',    team: 'PIT' },  // R5P169
  { name: 'Joe Royer',           team: 'CLE' },  // R5P170
  { name: 'Josh Cuevas',         team: 'BAL' },  // R5P173
  { name: 'Seydou Traore',       team: 'MIA' },  // R5P180
  { name: 'Bauer Sharp',         team: 'TB'  },  // R6P185
  { name: 'Jack Endries',        team: 'CIN' },  // R7P221
  { name: 'Jaren Kanak',         team: 'TEN' },  // R7P225
  { name: 'Carsen Ryan',         team: 'CLE' },  // R7P248
  { name: 'Dallen Bentley',      team: 'DEN' },  // R7P256

  // ── IDP: EDGE / DL ─────────────────────────────────────────────────────────
  // Uncomment if your league scores individual defensive players (IDP)
  // { name: 'David Bailey',        team: 'NYJ' },  // R1P2
  // { name: 'Arvell Reese',        team: 'NYG' },  // R1P5
  // { name: 'Rueben Bain',         team: 'TB'  },  // R1P15
  // { name: 'Akheem Mesidor',      team: 'LAC' },  // R1P22
  // { name: 'Malachi Lawrence',    team: 'DAL' },  // R1P23
  // { name: 'Keldric Faulk',       team: 'TEN' },  // R1P31
  // { name: 'TJ Parker',           team: 'BUF' },  // R2P35
  // { name: 'R Mason Thomas',      team: 'KC'  },  // R2P40
  // { name: 'Cashius Howell',      team: 'CIN' },  // R2P41
  // { name: 'Derrick Moore',       team: 'DET' },  // R2P44
  // { name: 'Zion Young',          team: 'BAL' },  // R2P45
  // { name: 'Romello Height',      team: 'SF'  },  // R3P70
  // { name: 'Jaishawn Barham',     team: 'DAL' },  // R3P92
  // { name: 'Dani Dennis-Sutton',  team: 'GB'  },  // R4P120
  // { name: 'Wasley Williams',     team: 'CAR' },  // R4P119
  // { name: 'Trey Moore',          team: 'MIA' },  // R4P130
  // { name: 'LT Overton',          team: 'DAL' },  // R4P137
  // { name: 'Joshua Josephs',      team: 'WAS' },  // R5P147
  // { name: 'George Gumbs',        team: 'IND' },  // R5P156
  // { name: 'Gabe Rubio',          team: 'PIT' },  // R6P210
  // { name: 'Caden Curry',         team: 'IND' },  // R6P214
  // { name: 'Max Llewellyn',       team: 'MIA' },  // R7P238
  // { name: 'Zach Durfee',         team: 'JAX' },  // R7P233
  // { name: 'Quintayvious Hutchins', team: 'NE' }, // R7P247

  // ── IDP: LB ────────────────────────────────────────────────────────────────
  // { name: 'Sonny Styles',        team: 'WAS' },  // R1P7
  // { name: 'Jacob Rodriguez',     team: 'MIA' },  // R2P43
  // { name: 'Josiah Trotter',      team: 'TB'  },  // R2P46
  // { name: 'Jake Golday',         team: 'MIN' },  // R2P51
  // { name: 'CJ Allen',            team: 'IND' },  // R2P53
  // { name: 'Anthony Hill',        team: 'TEN' },  // R2P60
  // { name: 'Wade Woodaz',         team: 'HOU' },  // R4P123
  // { name: 'Kaleb Elarms-Orr',    team: 'BUF' },  // R4P126
  // { name: 'Kendal Daniels',      team: 'ATL' },  // R4P134
  // { name: 'Bryce Boettcher',     team: 'IND' },  // R4P135
  // { name: 'Kyle Louis',          team: 'MIA' },  // R4P138
  // { name: 'Justin Jefferson',    team: 'CLE' },  // R5P149
  // { name: 'Jaden Dugger',        team: 'SF'  },  // R5P154
  // { name: 'Keyshaun Elliott',    team: 'CHI' },  // R5P166
  // { name: 'Harold Perkins',      team: 'ATL' },  // R6P215
  // { name: 'Namdi Obiazor',       team: 'NE'  },  // R6P212

  // ── IDP: CB / S ────────────────────────────────────────────────────────────
  // { name: 'Mansoor Delane',      team: 'KC'  },  // R1P6
  // { name: 'Dillon Thieneman',    team: 'CHI' },  // R1P25
  // { name: 'Chris Johnson',       team: 'MIA' },  // R1P27
  // { name: 'Caleb Downs',         team: 'DAL' },  // R1P11
  // { name: 'Treydan Stukes',      team: 'LV'  },  // R2P38
  // { name: 'Colton Hood',         team: 'NYG' },  // R2P37
  // { name: 'Avieon Terrell',      team: 'ATL' },  // R2P48
  // { name: 'Brandon Cisse',       team: 'GB'  },  // R2P52
  // { name: 'Emmanuel McNeil-Warren', team: 'CLE' }, // R2P58
  // { name: 'Davison Igbinosun',   team: 'BUF' },  // R2P62
  // { name: 'Bud Clark',           team: 'PHI' },  // R2P64
  // { name: 'Tacario Davis',       team: 'CIN' },  // R3P72
  // { name: 'A.J. Haulcy',         team: 'IND' },  // R3P78
  // { name: 'Daylen Everette',     team: 'PIT' },  // R3P85
  // { name: 'Julian Neal',         team: 'SEA' },  // R3P99
  // { name: 'Jakobe Thomas',       team: 'MIN' },  // R3P98
  // { name: 'Jalen Huskey',        team: 'JAX' },  // R3P100
  // { name: 'Jermod McCoy',        team: 'LV'  },  // R4P101
  // { name: 'Jadon Canady',        team: 'KC'  },  // R4P109
  // { name: 'Devin Moore',         team: 'DAL' },  // R4P114
  // { name: 'Keionte Scott',       team: 'TB'  },  // R4P116
  // { name: 'Malik Muhammad',      team: 'CHI' },  // R4P124
  // { name: 'Genesis Smith',       team: 'LAC' },  // R4P131
  // { name: 'Ephesians Prysock',   team: 'SF'  },  // R4P139
  // { name: 'Kamari Ramsey',       team: 'HOU' },  // R5P141
  // { name: 'Zakee Wheatley',      team: 'MIA' },  // R5P151
  // { name: 'Chandler Rivers',     team: 'BAL' },  // R5P162
  // { name: 'Jalon Kilgore',       team: 'BUF' },  // R5P167
  // { name: 'Michael Taaffe',      team: 'MIA' },  // R5P158
  // { name: 'Karon Prunty',        team: 'NE'  },  // R5P171
  // { name: 'Lorenzo Styles',      team: 'NO'  },  // R5P172
  // { name: 'Hezekiah Masses',     team: 'LV'  },  // R5P175
  // { name: 'Domani Jackson',      team: 'GB'  },  // R6P201
]
