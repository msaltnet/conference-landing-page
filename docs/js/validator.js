// 프로그램 데이터 검증 함수들

/**
 * 프로그램 데이터의 유효성을 검증합니다.
 * @param {Object} programData - 검증할 프로그램 데이터
 * @returns {Object} - 검증 결과 { isValid: boolean, errors: string[] }
 */
function validateProgramData(programData) {
    const errors = [];
    
    // 필수 필드 검증
    if (!programData.programs || !Array.isArray(programData.programs)) {
        errors.push('programs 배열이 없거나 유효하지 않습니다.');
        return { isValid: false, errors };
    }
    
    if (!programData.locations || !Array.isArray(programData.locations)) {
        errors.push('locations 배열이 없거나 유효하지 않습니다.');
        return { isValid: false, errors };
    }
    
    if (!programData.categories || !Array.isArray(programData.categories)) {
        errors.push('categories 배열이 없거나 유효하지 않습니다.');
        return { isValid: false, errors };
    }
    
    // 각 프로그램 검증
    programData.programs.forEach((program, index) => {
        const programErrors = validateProgram(program, index, programData.locations, programData.categories);
        errors.push(...programErrors);
    });
    
    // 분류 색상 정보 검증
    const categoryColorErrors = validateCategoryColors(programData.categories);
    errors.push(...categoryColorErrors);
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 개별 프로그램의 유효성을 검증합니다.
 * @param {Object} program - 검증할 프로그램
 * @param {number} index - 프로그램 인덱스
 * @param {Array} validLocations - 유효한 장소 목록
 * @param {Array} validCategories - 유효한 분류 목록
 * @returns {Array} - 오류 메시지 배열
 */
function validateProgram(program, index, validLocations, validCategories) {
    const errors = [];
    const programPrefix = `프로그램 ${index + 1}`;
    
    // 필수 필드 검증
    const requiredFields = ['id', 'date', 'time', 'location', 'title', 'content', 'speaker', 'affiliation', 'category'];
    requiredFields.forEach(field => {
        if (!program[field]) {
            errors.push(`${programPrefix}: ${field} 필드가 없습니다.`);
        }
    });
    
    // 장소 검증
    if (program.location && !validLocations.includes(program.location)) {
        errors.push(`${programPrefix}: '${program.location}'은 유효하지 않은 장소입니다. 유효한 장소: ${validLocations.join(', ')}`);
    }
    
    // 분류 검증 (새로운 구조 지원)
    if (program.category) {
        const categoryNames = validCategories.map(cat => typeof cat === 'string' ? cat : cat.name);
        if (!categoryNames.includes(program.category)) {
            errors.push(`${programPrefix}: '${program.category}'은 유효하지 않은 분류입니다. 유효한 분류: ${categoryNames.join(', ')}`);
        }
    }
    
    // 날짜 형식 검증
    if (program.date && !isValidDate(program.date)) {
        errors.push(`${programPrefix}: '${program.date}'은 유효하지 않은 날짜 형식입니다. (YYYY-MM-DD 형식이어야 합니다)`);
    }
    
    // 시간 형식 검증
    if (program.time && !isValidTime(program.time)) {
        errors.push(`${programPrefix}: '${program.time}'은 유효하지 않은 시간 형식입니다. (HH:MM-HH:MM 형식이어야 합니다)`);
    }
    
    return errors;
}

/**
 * 색상 형식을 검증합니다.
 * @param {string} colorString - 검증할 색상 문자열
 * @returns {boolean} - 유효한 색상인지 여부
 */
function isValidColor(colorString) {
    // HEX 색상 형식 검증 (#RRGGBB 또는 #RGB)
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(colorString);
}

/**
 * 분류 색상 정보를 검증합니다.
 * @param {Array} categories - 검증할 분류 배열
 * @returns {Array} - 오류 메시지 배열
 */
function validateCategoryColors(categories) {
    const errors = [];
    
    if (!Array.isArray(categories)) {
        errors.push('categories는 배열이어야 합니다.');
        return errors;
    }
    
    categories.forEach((category, index) => {
        const categoryPrefix = `분류 ${index + 1}`;
        
        if (typeof category === 'string') {
            // 기존 문자열 형식은 허용 (하위 호환성)
            return;
        }
        
        if (typeof category === 'object' && category !== null) {
            // 필수 필드 검증
            if (!category.name) {
                errors.push(`${categoryPrefix}: name 필드가 없습니다.`);
            }
            
            if (category.color && !isValidColor(category.color)) {
                errors.push(`${categoryPrefix}: '${category.color}'은 유효하지 않은 색상 형식입니다. (#RRGGBB 또는 #RGB 형식이어야 합니다)`);
            }
            
            if (category.backgroundColor && !isValidColor(category.backgroundColor)) {
                errors.push(`${categoryPrefix}: '${category.backgroundColor}'은 유효하지 않은 배경색 형식입니다. (#RRGGBB 또는 #RGB 형식이어야 합니다)`);
            }
            
            if (category.borderColor && !isValidColor(category.borderColor)) {
                errors.push(`${categoryPrefix}: '${category.borderColor}'은 유효하지 않은 테두리색 형식입니다. (#RRGGBB 또는 #RGB 형식이어야 합니다)`);
            }
        } else {
            errors.push(`${categoryPrefix}: 유효하지 않은 분류 형식입니다.`);
        }
    });
    
    return errors;
}

/**
 * 날짜 형식을 검증합니다.
 * @param {string} dateString - 검증할 날짜 문자열
 * @returns {boolean} - 유효한 날짜인지 여부
 */
function isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
        return false;
    }
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * 시간 형식을 검증합니다.
 * @param {string} timeString - 검증할 시간 문자열
 * @returns {boolean} - 유효한 시간인지 여부
 */
function isValidTime(timeString) {
    const timeRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
    if (!timeRegex.test(timeString)) {
        return false;
    }
    
    const [startTime, endTime] = timeString.split('-');
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    return start !== null && end !== null && start < end;
}

/**
 * 시간 문자열을 분 단위로 변환합니다.
 * @param {string} timeString - 시간 문자열 (HH:MM)
 * @returns {number|null} - 분 단위 시간 또는 null
 */
function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }
    return hours * 60 + minutes;
}

/**
 * 프로그램 데이터를 로드하고 검증합니다.
 * @param {string} filePath - JSON 파일 경로
 * @returns {Promise<Object>} - 검증 결과
 */
async function loadAndValidateProgramData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`파일을 로드할 수 없습니다: ${response.status}`);
        }
        
        const programData = await response.json();
        const validation = validateProgramData(programData);
        
        return {
            data: programData,
            validation: validation
        };
    } catch (error) {
        return {
            data: null,
            validation: {
                isValid: false,
                errors: [`데이터 로드 오류: ${error.message}`]
            }
        };
    }
}

// Node.js 환경에서 사용할 수 있도록 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateProgramData,
        validateProgram,
        isValidDate,
        isValidTime,
        isValidColor,
        validateCategoryColors,
        loadAndValidateProgramData
    };
}
