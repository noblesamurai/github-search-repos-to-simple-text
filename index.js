const args = require('args');
const GithubApi = require('github');
const github = new GithubApi();

args.option('token', 'The user token');
args.option('commits', 'Search for issues');

const flags = args.parse(process.argv);

github.authenticate({
  type: 'token',
  token: flags.token
});

function pick(key, dflt = '') {
  const path = key.split('.');
  return function(haystack) {
    let ret = haystack;
    for (let key of path) {
      if (!(key in ret)) {
        ret = undefined;
        break;
      }
      ret = ret[key];
    }
    return ret || dflt;
  };
}

function clean (col) {
  return  '"' + String(col).replace('"', '""') + '"';
}

function buildItem2Row(cols, dflt='') {
  let trans = cols.map((key) => pick(key));
  let transFn = (item) => trans.map((fn) => clean(fn(item))).join('\t');
  return transFn;
}

function printResults (page = 0) {
  let cols = ['url', 'title'];
  let item2row = buildItem2Row(cols, '');
  github.search.issues({ q: args.sub[0], page }).then((result) => {
    result.data.items.forEach((item) => {
      console.log(item2row(item));
    });
    if (github.hasNextPage(result)) return printResults(++page);
  }).catch(console.error);
}

function printCommits (page = 0) {
  let cols = ['html_url', 'repository.full_name', 'sha', 'commit.committer.date', 'commit.author.name', 'commit.message'];
  let item2row = buildItem2Row(cols, '');
  github.search.commits({ q: args.sub[0], page }).then((result) => {
    result.data.items.forEach((item) => {
      console.log(item2row(item));
    });
    if (github.hasNextPage(result)) return printCommits(++page);
  }).catch(console.error);
}

if (flags.commits) {
  printCommits();
} else {
  printResults();
}
