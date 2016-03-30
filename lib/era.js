module.exports =  function(pDefaultSlug) {

	this.fromSlug = function(slug) {
		this.slug = slug;
		if (/^\d\d\d0s$/.test(slug)) {
			this.decade = parseInt(slug.match(/\d\d\d0/)[0]);
		} else if (/^\d\d\d\d$/.test(slug)) {
      year = parseInt(slug);
      this.decade = year - (year%10);
			this.year = year;
		} else if (/^\d\d\d\d-\d\d$/.test(slug)) {
			numbers = slug.match(/\d+/g);
      year = parseInt(numbers[0]);
      this.decade = year - (year%10);
			this.year = year;
			this.month = parseInt(numbers[1]);
		}
	}

	if (pDefaultSlug) {
		this.fromSlug(pDefaultSlug);
	}
}
