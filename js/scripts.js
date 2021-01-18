// const teamsURL = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams`;

const teamsURL = 'https://boxscores.vercel.app/api/teams';
const chumps = [
  {
    name: 'Brent',
    teams: ['Celtics', '76ers', 'Magic', 'Grizzlies', 'Timberwolves'],
  },
  {
    name: 'Brett',
    teams: ['Nets', 'Heat', 'Pelicans', 'Rockets', 'Thunder'],
  },
  {
    name: 'Raf',
    teams: ['Lakers', 'Mavericks', 'Blazers', 'Bulls', 'Cavaliers'],
  },
  {
    name: 'Sean',
    teams: ['Bucks', 'Pacers', 'Suns', 'Spurs', 'Hornets'],
  },
  {
    name: 'Jake',
    teams: ['Nuggets', 'Warriors', 'Hawks', 'Wizards', 'Pistons'],
  },
  {
    name: 'Jett',
    teams: ['Clippers', 'Raptors', 'Jazz', 'Kings', 'Knicks'],
  },
];

const getTeams = async () => {
  const res = await fetch(teamsURL);
  const data = await res.json();
  console.log({ data });
  return data;
};

const getParsedTeams = async () => {
  try {
    const res = await getTeams();
    const teams = res.sports[0].leagues[0].teams;
    const teamsNameToRecord = teams.reduce((acc, team) => {
      console.log(team);
      const statsValue = createStatsValue(team);
      acc[team.team.name] = { ...statsValue, name: team.team.name };
      return acc;
    }, {});
    console.log({ teams, teamsNameToRecord });
    return teamsNameToRecord;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const createStatsValue = (team) => {
  const keys = ['wins', 'losses', 'winPercent'];
  return team.team.record.items[0].stats.reduce((acc, stat) => {
    if (keys.includes(stat.name)) {
      acc[stat.name] = stat.value;
    }
    return acc;
  }, {});
};

const mapStatsToChumps = async () => {
  const parsedTeams = await getParsedTeams();
  const newChumps = chumps.map((chump) => {
    const newTeams = chump.teams
      .map(
        (team) =>
          parsedTeams[team] || { name: team, wins: 0, losses: 0, winPercent: 0 }
      )
      .sort((a, b) => b.winPercent - a.winPercent);
    return { ...chump, teams: newTeams };
  });

  console.log({ newChumps });
  return newChumps.sort((a, b) => {
    const { overallWinPercent: awin } = getChumpsTotals(a);
    const { overallWinPercent: bwin } = getChumpsTotals(b);
    return bwin - awin;
  });
};

const getChumpsTotals = (chump) => {
  const totalWins = chump.teams.reduce((tot, team) => {
    return tot + team.wins;
  }, 0);

  const totalLosses = chump.teams.reduce((tot, team) => {
    return tot + team.losses;
  }, 0);

  const overallWinPercent = totalWins / (totalLosses + totalWins);

  return { totalWins, totalLosses, overallWinPercent };
};

const buildChumpTable = (chump) => {
  const { totalWins, totalLosses, overallWinPercent } = getChumpsTotals(chump);
  const rows = chump.teams.map((team) => {
    return `
      <tr>
        <td>${team.name}</td>
        <td>${team.winPercent.toFixed(3)}</td>
        <td>${team.wins}</td>
        <td>${team.losses}</td>
      </tr>
    `;
  });

  return `

    <li>
      <h3>${chump.name}</h3>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Win %</th>
            <th>Wins</th>
            <th>Losses</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Totals</td>
            <td>${overallWinPercent.toFixed(3)}</td>
            <td>${totalWins}</td>
            <td>${totalLosses}</td>
          </tr>
          ${rows.join('')}
        </tbody>
      </table>
    </li>
  `;
};

const buildTables = async () => {
  const chumpsWithData = await mapStatsToChumps();
  const content = chumpsWithData
    .map((chump) => {
      const chumpTable = buildChumpTable(chump);
      return chumpTable;
    })
    .join('');
  const ul = document.getElementById('tables');
  ul.innerHTML = content;
};

window.addEventListener('load', (event) => {
  buildTables();
});
