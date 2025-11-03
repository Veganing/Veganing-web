// 백엔드 API 호출 함수들
import { API_ENDPOINTS, apiClient } from '../config/api';

// ==========================================
// 인증 API
// ==========================================

/**
 * 회원가입
 * @param {Object} userData - { email, password, nickname, veganType }
 * @returns {Promise<Object>} - { message, user, token }
 */
export const signup = async (userData) => {
  return await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
};

/**
 * 로그인
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { message, user, token }
 */
export const login = async (credentials) => {
  return await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
};

/**
 * 내 프로필 조회 (JWT 토큰 필요)
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { user }
 */
export const getMyProfile = async (token) => {
  return await apiClient.get(API_ENDPOINTS.AUTH.ME, token);
};

/**
 * 프로필 수정 (JWT 토큰 필요)
 * @param {Object} updateData - { nickname?, veganType?, profileImage? }
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { message, user }
 */
export const updateProfile = async (updateData, token) => {
  return await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, updateData, token);
};

// ==========================================
// 챌린지 API
// ==========================================

/**
 * 새 챌린지 시작 (JWT 토큰 필요)
 * @param {Object} challengeData - { title, description, duration, difficulty? }
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { message, challenge }
 */
export const startChallenge = async (challengeData, token) => {
  return await apiClient.post(API_ENDPOINTS.CHALLENGE.START, challengeData, token);
};

/**
 * 현재 진행중인 챌린지 조회 (JWT 토큰 필요)
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { challenge }
 */
export const getCurrentChallenge = async (token) => {
  return await apiClient.get(API_ENDPOINTS.CHALLENGE.CURRENT, token);
};

/**
 * 챌린지 히스토리 조회 (JWT 토큰 필요)
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { challenges }
 */
export const getChallengeHistory = async (token) => {
  return await apiClient.get(API_ENDPOINTS.CHALLENGE.HISTORY, token);
};

/**
 * 챌린지 통계 조회 (JWT 토큰 필요)
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { stats }
 */
export const getChallengeStats = async (token) => {
  return await apiClient.get(API_ENDPOINTS.CHALLENGE.STATS, token);
};

/**
 * 챌린지 진행률 업데이트 (JWT 토큰 필요)
 * @param {number} challengeId - 챌린지 ID
 * @param {number} progress - 진행률 (0-100)
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { message, challenge }
 */
export const updateChallengeProgress = async (challengeId, progress, token) => {
  return await apiClient.put(
    API_ENDPOINTS.CHALLENGE.PROGRESS(challengeId),
    { progress },
    token
  );
};

/**
 * 챌린지 포기 (JWT 토큰 필요)
 * @param {number} challengeId - 챌린지 ID
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { message, challenge }
 */
export const quitChallenge = async (challengeId, token) => {
  return await apiClient.put(API_ENDPOINTS.CHALLENGE.QUIT(challengeId), {}, token);
};

// ==========================================
// 커뮤니티 API
// ==========================================

/**
 * 게시물 목록 조회
 * @param {Object} params - { limit?, offset?, category? }
 * @returns {Promise<Object>} - { posts, total }
 */
export const getPosts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_ENDPOINTS.COMMUNITY.POSTS}?${queryString}` : API_ENDPOINTS.COMMUNITY.POSTS;
  return await apiClient.get(url);
};

/**
 * 게시물 상세 조회
 * @param {number} postId - 게시물 ID
 * @returns {Promise<Object>} - { post }
 */
export const getPostDetail = async (postId) => {
  return await apiClient.get(API_ENDPOINTS.COMMUNITY.POST_DETAIL(postId));
};

/**
 * 게시물 작성 (JWT 토큰 필요)
 * @param {Object} postData - { content, imageUrl?, category? }
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { message, post }
 */
export const createPost = async (postData, token) => {
  return await apiClient.post(API_ENDPOINTS.COMMUNITY.POSTS, postData, token);
};

/**
 * 게시물 수정 (JWT 토큰 필요)
 * @param {number} postId - 게시물 ID
 * @param {Object} postData - { content?, imageUrl?, category? }
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { message, post }
 */
export const updatePost = async (postId, postData, token) => {
  return await apiClient.put(API_ENDPOINTS.COMMUNITY.POST_DETAIL(postId), postData, token);
};

/**
 * 게시물 삭제 (JWT 토큰 필요)
 * @param {number} postId - 게시물 ID
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { message }
 */
export const deletePost = async (postId, token) => {
  return await apiClient.delete(API_ENDPOINTS.COMMUNITY.POST_DETAIL(postId), token);
};

/**
 * 게시물 좋아요 (JWT 토큰 필요)
 * @param {number} postId - 게시물 ID
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { message, likes }
 */
export const likePost = async (postId, token) => {
  return await apiClient.post(API_ENDPOINTS.COMMUNITY.POST_LIKE(postId), {}, token);
};

/**
 * 커뮤니티 챌린지 목록 조회
 * @returns {Promise<Object>} - { challenges }
 */
export const getCommunityChallenges = async () => {
  return await apiClient.get(API_ENDPOINTS.COMMUNITY.CHALLENGES);
};

/**
 * 커뮤니티 챌린지 상세 조회
 * @param {number} challengeId - 챌린지 ID
 * @returns {Promise<Object>} - { challenge }
 */
export const getCommunityChallenge = async (challengeId) => {
  return await apiClient.get(API_ENDPOINTS.COMMUNITY.CHALLENGE_DETAIL(challengeId));
};

/**
 * 커뮤니티 챌린지 참여 (JWT 토큰 필요)
 * @param {number} challengeId - 챌린지 ID
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { message, userChallenge }
 */
export const joinCommunityChallenge = async (challengeId, token) => {
  return await apiClient.post(API_ENDPOINTS.COMMUNITY.CHALLENGE_JOIN(challengeId), {}, token);
};

/**
 * 내 챌린지 목록 조회 (JWT 토큰 필요)
 * @param {Object} params - { status? }
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - { challenges }
 */
export const getMyChallenges = async (params = {}, token) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_ENDPOINTS.COMMUNITY.MY_CHALLENGES}?${queryString}` : API_ENDPOINTS.COMMUNITY.MY_CHALLENGES;
  return await apiClient.get(url, token);
};

// ==========================================
// 토큰 관리 헬퍼 함수
// ==========================================

/**
 * 로컬 스토리지에 토큰 저장
 * @param {string} token - JWT 토큰
 */
export const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * 로컬 스토리지에서 토큰 가져오기
 * @returns {string|null} - JWT 토큰
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * 로컬 스토리지에서 토큰 삭제
 */
export const removeToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * 사용자 정보 저장
 * @param {Object} user - 사용자 객체
 */
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * 사용자 정보 가져오기
 * @returns {Object|null} - 사용자 객체
 */
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * 사용자 정보 삭제
 */
export const removeUser = () => {
  localStorage.removeItem('user');
};

/**
 * 로그아웃 (토큰 및 사용자 정보 삭제)
 */
export const logout = () => {
  removeToken();
  removeUser();
};
