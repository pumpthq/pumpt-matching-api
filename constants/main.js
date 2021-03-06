module.exports = Object.freeze({
    DEFAULT_USER_AVATAR : '',
    DEFAULT_COMPANY_LOGO: '',

  MAX_BODY_SIZE: 4000000, //4Mb

    UUID_V4_PATTERN: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,

    MESSAGES_PER_PAGE: 5,

    EMAIL_TYPES: ['CONFIRMATION', 'PROFILE', 'OLD_JOB'],
    EMAIL_TYPE: {
      CONFIRMATION: 'CONFIRMATION',
      PROFILE: 'PROFILE',
      OLD_JOB: 'OLD_JOB',
      PENDING_MATCH_RECRUITER: 'PENDING_MATCH_RECRUITER',
      PENDING_MATCH_CANDIDATE: 'PENDING_MATCH_CANDIDATE',
			STATUS_REPORT_RECRUITER: 'STATUS_REPORT_RECRUITER'
    },

    USER_MODEL: {
        CANDIDATE: 'Candidate',
        RECRUITER: 'Recruiter'
    },

    USER_MODELS: [
        'Candidate',
        'Recruiter'
    ],

    VACANCY_STATUS: {
        OPENED: 'opened',
        CLOSED: 'closed',
        DRAFT : 'draft',
        ALL   : 'all'
    },

    VACANCY_STATUSES: [
        'opened',
        'closed',
        'draft',
        'all'
    ],

    CANDIDATE_FILL_STEP: {
        PROFILE_PHOTO_STEP: 'CANDIDATE_APPLICATION_PROFILE_PHOTO_STEP',
        EXPERIENCE_STEP   : 'CANDIDATE_APPLICATION_EXPERIENCE_STEP',
        EDUCATION_STEP    : 'CANDIDATE_APPLICATION_EDUCATION_STEP',
        LOCATION_STEP     : 'CANDIDATE_APPLICATION_LOCATION_STEP',
        SOCIAL_MEDIA_STEP : 'CANDIDATE_APPLICATION_SOCIAL_MEDIA_STEP',
        SKILLS_STEP       : 'CANDIDATE_APPLICATION_SKILLS_STEP',
        INTERESTS_STEP    : 'CANDIDATE_APPLICATION_INTERESTS_STEP'
    },

    CANDIDATE_FILL_STEPS: [
        'CANDIDATE_APPLICATION_PROFILE_PHOTO_STEP',
        'CANDIDATE_APPLICATION_EXPERIENCE_STEP',
        'CANDIDATE_APPLICATION_EDUCATION_STEP',
        'CANDIDATE_APPLICATION_LOCATION_STEP',
        'CANDIDATE_APPLICATION_SOCIAL_MEDIA_STEP',
        'CANDIDATE_APPLICATION_SKILLS_STEP',
        'CANDIDATE_APPLICATION_INTERESTS_STEP'
    ],

    COMPANY_FILL_STEP: {
        PROFILE_PHOTO_STEP : 'COMPANY_APPLICATION_PROFILE_PHOTO_STEP',
        SOCIAL_MEDIA_STEP  : 'COMPANY_APPLICATION_SOCIAL_MEDIA_STEP',
        LOCATION_STEP      : 'COMPANY_APPLICATION_LOCATION_STEP',
        DESCRIPTION_STEP   : 'COMPANY_APPLICATION_DESCRIPTION_STEP',
        QUOTE_OR_MOTTO_STEP: 'COMPANY_APPLICATION_QUOTE_OR_MOTTO_STEP',
        PHOTO_STEP         : 'COMPANY_APPLICATION_PHOTO_STEP'
    },

    COMPANY_FILL_STEPS: [
        'COMPANY_APPLICATION_PROFILE_PHOTO_STEP',
        'COMPANY_APPLICATION_SOCIAL_MEDIA_STEP',
        'COMPANY_APPLICATION_LOCATION_STEP',
        'COMPANY_APPLICATION_DESCRIPTION_STEP',
        'COMPANY_APPLICATION_QUOTE_OR_MOTTO_STEP',
        'COMPANY_APPLICATION_PHOTO_STEP'
    ]
});
