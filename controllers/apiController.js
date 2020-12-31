function index(req, res) {
  res.json({
    message: 'Welcome to TuneMe!',
    documentation_url: 'https://github.com/cyberinertia/tuneme',
    base_url: 'localhost:3000',
    endpoints: [
      {
        method: 'GET', path: '/api', description: 'Describes available endpoints'
      }
    ]
  });
}

module.exports = {
  index: index
}
