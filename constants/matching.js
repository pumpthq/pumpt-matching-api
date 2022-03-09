module.exports = Object.freeze({

    EMPLOYEES_AMOUNTS: [
        '< 10 employees',
        '10-50 employees',
        '50-100 employees',
        '100-200 employees',
        '200-500 employees',
        '500+ employees'
    ],

    EMPLOYEES_AMOUNT: {
        lt10      : '< 10 employees',
        gt10lt50  : '10-50 employees',
        gt50lt100 : '50-100 employees',
        gt100lt200: '100-200 employees',
        gt200lt500: '200-500 employees',
        gt500     : '500+ employees'
    },

    EMPLOYMENT: {
        FULL_TIME    : 'Full-Time',
        PART_TIME    : 'Part-Time',
        FREELANCE    : 'Freelance'
    },

    EMPLOYMENTS: [
        'Full-Time',
        'Part-Time',
        'Freelance'
    ],

    RECENT_ANNUAL_INCOME: {
        lt100     : '<$100K',
        gt100lt150: '$100K-$149K',
        gt150lt200: '$150K-$199K',
        gt200lt300: '$200K-$299K',
        gt300lt400: '$300K-$399K',
        gt400lt500: '$400K-$499K',
        gt500     : '$500K+'
    },


    RECENT_ANNUAL_INCOMES: [
        '<$100K',
        '$100K-$149K',
        '$150K-$199K',
        '$200K-$299K',
        '$300K-$399K',
        '$400K-$499K',
        '$500K+'
    ],

    PREFERRED_COMPANY_SIZE: {
        lt10     : '<10 employees',
        gt10lt50: '10-50 employees',
        gt50lt100: '50-100 employees',
        gt100lt200: '100-200 employees',
        gt200lt500: '200-500 employees',
        gt500     : '500+ employees',
        gt500     : 'No Preference'
    },


    PREFERRED_COMPANY_SIZES: [
				'<10 employees',
				'10-50 employees',
				'50-100 employees',
				'100-200 employees',
				'200-500 employees',
				'500+ employees',
				'No Preference'
    ],

    // Vacancy experience. Take smaller and compare with candidate working experience on current vacancy position
    EXPERIENCE: {
        gt0lt2  : '0-2 years',      // years
        gt2lt5  : '3-5 years',
        gt5lt10 : '6-10 years',
        gt10lt15: '11-15 years',
        gt15    : '16+ years'
    },

    EXPERIENCES: [
        '0-2 years',
        '3-5 years',
        '6-10 years',
        '11-15 years',
        '16+ years'
    ],

    // Candidate degree should be greater or equal to vacancy degree
    DEGREE: {
        HIGHSCHOOL       : 'High School',
        UNDERGRADUATEDEGREE  : 'Undergraduate',
        GRADUATEDEGREE     : 'Graduate',
        OTHER             : 'Other'
    },

    DEGREES: [
        'High School',
         'Undergraduate',
         'Graduate',
         'Other'
    ],

    VALUE_ASSESSMENTS: [
			'Salary | Benefits | Perks',
			'Culture & Values',
			'Flexible Work Environment',
			'Professional Growth',
			'Start-up | Entrepreneurial'
    ],

    VALUE_ASSESSMENT: {
        salary 				: 'Salary | Benefits | Perks',
        culture    		: 'Culture & Values',
				flexible			: 'Flexible Work Environment',
        professional  : 'Professional Growth',
				startUp				: 'Start-up | Entrepreneurial'
    }
});
