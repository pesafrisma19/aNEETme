fetch("http://localhost:3000/api/search?server=cinema&type=recent&page=1")
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
