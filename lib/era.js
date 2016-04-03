module.exports =  function(pDefaultSlug) {

	var _digits = [0,1,2,3,4,5,6,7,8,9];
	var _monthSlugs = ["01","02","03","04","05","06","07","08","09","10","11","12"];

	this.fromSlug = function(slug) {
		this.slug = slug;
		if (/^\d\d\d0s$/.test(slug)) {
			decade = parseInt(slug.match(/\d\d\d0/)[0]);
			this.decade = decade;
			this.years = _digits.map(function(d) { return decade+d; });
		} else if (/^\d\d\d\d$/.test(slug)) {
      year = parseInt(slug);
      this.decade = year - (year%10);
			this.year = year;
			this.months = _monthSlugs.map(function(s) { return ""+year+"-"+s; });
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
