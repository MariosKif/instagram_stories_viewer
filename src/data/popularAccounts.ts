export interface PopularAccount {
  username: string;
  displayName: string;
  category: string;
  description: string;
}

export const popularAccounts: PopularAccount[] = [
  { username: 'instagram', displayName: 'Instagram', category: 'Platform', description: 'Analyze Instagram\'s official account — follower trends, engagement metrics, posting frequency, and content strategy insights.' },
  { username: 'cristiano', displayName: 'Cristiano Ronaldo', category: 'Sports', description: 'Analyze Cristiano Ronaldo\'s Instagram — follower growth, engagement rate, top posts, and content performance analytics.' },
  { username: 'leomessi', displayName: 'Leo Messi', category: 'Sports', description: 'Analyze Lionel Messi\'s Instagram — follower trends, engagement metrics, posting habits, and performance insights.' },
  { username: 'selenagomez', displayName: 'Selena Gomez', category: 'Music', description: 'Analyze Selena Gomez\'s Instagram — engagement rate, follower growth, top content, and audience interaction trends.' },
  { username: 'kyliejenner', displayName: 'Kylie Jenner', category: 'Celebrity', description: 'Analyze Kylie Jenner\'s Instagram — follower stats, engagement metrics, brand content performance, and posting patterns.' },
  { username: 'therock', displayName: 'Dwayne Johnson', category: 'Entertainment', description: 'Analyze Dwayne "The Rock" Johnson\'s Instagram — engagement rate, follower growth, content mix, and audience insights.' },
  { username: 'arianagrande', displayName: 'Ariana Grande', category: 'Music', description: 'Analyze Ariana Grande\'s Instagram — follower trends, engagement analytics, top posts, and content strategy breakdown.' },
  { username: 'kimkardashian', displayName: 'Kim Kardashian', category: 'Celebrity', description: 'Analyze Kim Kardashian\'s Instagram — engagement metrics, follower growth, brand content performance, and posting trends.' },
  { username: 'beyonce', displayName: 'Beyonce', category: 'Music', description: 'Analyze Beyonce\'s Instagram — follower analytics, engagement rate, top-performing posts, and content strategy insights.' },
  { username: 'khloekardashian', displayName: 'Khloe Kardashian', category: 'Celebrity', description: 'Analyze Khloe Kardashian\'s Instagram — engagement trends, follower growth, content performance, and audience insights.' },
  { username: 'justinbieber', displayName: 'Justin Bieber', category: 'Music', description: 'Analyze Justin Bieber\'s Instagram — follower trends, engagement rate, posting frequency, and top content analytics.' },
  { username: 'kendalljenner', displayName: 'Kendall Jenner', category: 'Fashion', description: 'Analyze Kendall Jenner\'s Instagram — engagement metrics, follower growth, fashion content performance, and audience trends.' },
  { username: 'natgeo', displayName: 'National Geographic', category: 'Media', description: 'Analyze National Geographic\'s Instagram — engagement rate, follower trends, content strategy, and top-performing posts.' },
  { username: 'taylorswift', displayName: 'Taylor Swift', category: 'Music', description: 'Analyze Taylor Swift\'s Instagram — follower growth, engagement analytics, top posts, and content performance breakdown.' },
  { username: 'virat.kohli', displayName: 'Virat Kohli', category: 'Sports', description: 'Analyze Virat Kohli\'s Instagram — engagement rate, follower trends, brand content performance, and posting patterns.' },
  { username: 'jlo', displayName: 'Jennifer Lopez', category: 'Entertainment', description: 'Analyze Jennifer Lopez\'s Instagram — follower growth, engagement metrics, content mix, and audience interaction trends.' },
  { username: 'nickiminaj', displayName: 'Nicki Minaj', category: 'Music', description: 'Analyze Nicki Minaj\'s Instagram — engagement rate, follower analytics, top-performing content, and posting strategy.' },
  { username: 'kourtneykardash', displayName: 'Kourtney Kardashian', category: 'Celebrity', description: 'Analyze Kourtney Kardashian\'s Instagram — follower trends, engagement metrics, content performance, and audience insights.' },
  { username: 'nike', displayName: 'Nike', category: 'Brand', description: 'Analyze Nike\'s Instagram — engagement rate, follower growth, campaign performance, and brand content strategy insights.' },
  { username: 'neymarjr', displayName: 'Neymar Jr', category: 'Sports', description: 'Analyze Neymar Jr\'s Instagram — follower trends, engagement analytics, top posts, and content performance metrics.' },
  { username: 'zendaya', displayName: 'Zendaya', category: 'Entertainment', description: 'Analyze Zendaya\'s Instagram — engagement rate, follower growth, top content, and audience interaction analytics.' },
  { username: 'billieeilish', displayName: 'Billie Eilish', category: 'Music', description: 'Analyze Billie Eilish\'s Instagram — follower analytics, engagement trends, posting frequency, and content performance.' },
  { username: 'nasa', displayName: 'NASA', category: 'Science', description: 'Analyze NASA\'s Instagram — engagement rate, follower growth, educational content performance, and posting strategy.' },
  { username: 'shakira', displayName: 'Shakira', category: 'Music', description: 'Analyze Shakira\'s Instagram — follower trends, engagement metrics, top-performing posts, and content strategy insights.' },
  { username: 'ddlovato', displayName: 'Demi Lovato', category: 'Music', description: 'Analyze Demi Lovato\'s Instagram — engagement rate, follower growth, content performance, and audience analytics.' },
  { username: 'champagnepapi', displayName: 'Drake', category: 'Music', description: 'Analyze Drake\'s Instagram — follower analytics, engagement trends, top posts, and content strategy breakdown.' },
  { username: 'badgalriri', displayName: 'Rihanna', category: 'Fashion', description: 'Analyze Rihanna\'s Instagram — engagement rate, follower growth, fashion and brand content performance, and audience trends.' },
  { username: 'kevinhart4real', displayName: 'Kevin Hart', category: 'Entertainment', description: 'Analyze Kevin Hart\'s Instagram — follower trends, engagement metrics, comedy content performance, and posting patterns.' },
  { username: 'realmadrid', displayName: 'Real Madrid', category: 'Sports', description: 'Analyze Real Madrid\'s Instagram — engagement rate, follower growth, match day content performance, and fan interaction trends.' },
  { username: 'fcbarcelona', displayName: 'FC Barcelona', category: 'Sports', description: 'Analyze FC Barcelona\'s Instagram — follower analytics, engagement trends, content strategy, and top-performing posts.' },
];

const popularMap = new Map(popularAccounts.map((a) => [a.username.toLowerCase(), a]));

export function isPopularAccount(username: string): boolean {
  return popularMap.has(username.toLowerCase());
}

export function getPopularAccount(username: string): PopularAccount | undefined {
  return popularMap.get(username.toLowerCase());
}
