/*'Associate AE (Acct Exec)'*/
/*'Senior AE'*/
/*'AE'*/
var CURRENT_JOBS = [
	'Coordinator',
	'Planner',
	'Account Manager',
	'Account Executive',
	'Director',
	'VP',
	'SVP',
	'CRO',
	'Other'
];

var CURRENT_EXPERIENCE = {
    /*'Client Service': [
        'Integrated',
        'Digital'
    ],*/

    'Sales': [
        'Ad Tech/Platform',
        'Digital Media',
        'Programmatic',
        'SaaS/Enterprise',
        'Other'
    ],

    'Account Management': [
        'Digital',
        'Integrated',
        'Other'
    ],

    'Business Development': [
        'Ad Tech/Platform',
        'Digital Media',
        'Programmatic',
        'SaaS/Enterprise',
        'Other'
    ],

    'Marketing | Creative': [
        'Digital',
        'Integrated',
        'Other'
    ],

    'Ad Operations': [
        'Inventory Management',
        'Yield/Pricing',
        'Campaign Trafficking',
        'Other'
    ]

    /*'Sales Planning': [
        'Integrated',
        'Digital'
    ],

    'Marketing Service': [
        'Integrated',
        'Digital'
    ],

    'Revenue Operations': [
        'Inventory Management',
        'Campaign Trafficking',
        'Yield/Pricing'
    ],

    'Creative Service': [
        'Integrated',
        'Digital'
    ],

    'Executive Management': [
        'Marketing/Creative Services',
        'Sales Planning/Development',
        'Ad Operations',
        'Sales'
    ],*/
};

var CURRENT_INDUSTRIES = [
    'Ad Tech',
    'Digital Media',
    'Digital Platform',
    'Integrated Publisher',
    'Other'
];

module.exports.CURRENT_INDUSTRIES = CURRENT_INDUSTRIES;
module.exports.CURRENT_EXPERIENCE = CURRENT_EXPERIENCE;
module.exports.CURRENT_JOBS = CURRENT_JOBS;

//module.exports.CURRENT_JOBS_PARENTS = Object.keys(CURRENT_JOBS);
module.exports.CURRENT_EXPERIENCE_PARENTS = Object.keys(CURRENT_EXPERIENCE);
