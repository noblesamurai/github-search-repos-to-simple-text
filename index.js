const args = require('args');
const GithubApi = require('github');
const github = new GithubApi();

args.option('token', 'The user token');

const flags = args.parse(process.argv);

github.authenticate({
  type: 'token',
  token: flags.token
});

function printResults (page = 0) {
  github.search.issues({ q: args.sub[0], page }).then((result) => {
    result.data.items.forEach((item) => {
      console.log(item.url, '\t', item.title);
    });
    if (github.hasNextPage(result)) return printResults(++page);
  }).catch(console.error);
}

printResults();
