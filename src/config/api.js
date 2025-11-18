// API 설정 파일
// 환경 변수에서 API URL을 가져오고, 없으면 localhost를 기본값으로 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API 엔드포인트 정의
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    ME: `${API_BASE_URL}/api/auth/me`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
  },

  // 챌린지 관련
  CHALLENGE: {
    START: `${API_BASE_URL}/api/challenge/start`,
    CURRENT: `${API_BASE_URL}/api/challenge/current`,
    HISTORY: `${API_BASE_URL}/api/challenge/history`,
    STATS: `${API_BASE_URL}/api/challenge/stats`,
    PROGRESS: (id) => `${API_BASE_URL}/api/challenge/${id}/progress`,
    QUIT: (id) => `${API_BASE_URL}/api/challenge/${id}/quit`,
  },

  // 커뮤니티 관련
  COMMUNITY: {
    POSTS: `${API_BASE_URL}/api/community/posts`,
    POST_DETAIL: (id) => `${API_BASE_URL}/api/community/posts/${id}`,
    POST_LIKE: (id) => `${API_BASE_URL}/api/community/posts/${id}/like`,
    CHALLENGES: `${API_BASE_URL}/api/community/challenges`,
    CHALLENGE_DETAIL: (id) => `${API_BASE_URL}/api/community/challenges/${id}`,
    CHALLENGE_JOIN: (id) => `${API_BASE_URL}/api/community/challenges/${id}/join`,
    MY_CHALLENGES: `${API_BASE_URL}/api/community/my-challenges`,
  },
};

// 기본 fetch 옵션
export const getDefaultHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// API 호출 헬퍼 함수
export const apiClient = {
  // GET 요청
  get: async (url, token = null) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API 요청 실패');
    }

    return response.json();
  },

  // POST 요청
  post: async (url, data, token = null) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = 'API 요청 실패';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // 네트워크 에러나 기타 에러 처리
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      }
      throw error;
    }
  },

  // PUT 요청
  put: async (url, data, token = null) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API 요청 실패');
    }

    return response.json();
  },

  // DELETE 요청
  delete: async (url, token = null) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getDefaultHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API 요청 실패');
    }

    return response.json();
  },
};

export default API_BASE_URL;
