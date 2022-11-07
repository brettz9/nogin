const dbDefinitions = [
  {
    name: 'DB_NAME', alias: 'n', type: String,
    description: 'Database name; defaults to "nogin"',
    typeLabel: '{underline name}'
  },
  {
    name: 'DB_HOST', alias: 't', type: String,
    description: 'Database host; defaults to "127.0.0.1"',
    typeLabel: '{underline host}'
  },
  {
    name: 'DB_PORT', alias: 'p', type: Number,
    description: 'Database port; defaults to 27017',
    typeLabel: '{underline port}'
  },
  {
    name: 'DB_USER', alias: 'u', type: String,
    description: 'Database user; only needed with env=production',
    typeLabel: '{underline user}'
  },
  {
    name: 'DB_PASS', alias: 'x', type: String,
    description: 'Database password; only needed with env=production',
    typeLabel: '{underline password}'
  }
];

export default dbDefinitions;
