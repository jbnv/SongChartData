module.exports =  function(pDefaultSlug,options) {

	if (!options) options = {};

	var _digits = [0,1,2,3,4,5,6,7,8,9];
	var _monthSlugs = ["01","02","03","04","05","06","07","08","09","10","11","12"];
	var _monthNames = [
		"January","February","March","April","May","June",
		"July","August","September","October","November","December"
	];

	this.fromSlug = function(slug) {
		this.slug = slug;
		this.title = slug;
		if (/^\d\d\d0s$/.test(slug)) {
			decade = parseInt(slug.match(/\d\d\d0/)[0]);
			this.decade = decade;
			this.years = _digits.map(function(d) {
				return decade+d;
			});
		} else if (/^\d\d\d\d$/.test(slug)) {
      year = parseInt(slug);
      this.decade = year - (year%10);
			this.year = year;
			this.months = _monthSlugs.map(function(s) {
				return ""+year+"-"+s;
			});
		} else if (/^\d\d\d\d-\d\d$/.test(slug)) {
			numbers = slug.match(/\d+/g);
      year = parseInt(numbers[0]);
			month = parseInt(numbers[1]);
			this.title = _monthNames[month-1]+" "+year;
      this.decade = year - (year%10);
			this.year = year;
			this.month = month;
		}
	}

	if (pDefaultSlug) {
		this.fromSlug(pDefaultSlug);
	}
}
