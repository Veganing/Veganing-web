// src/components/layout/Header.jsx
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo/logo.svg';

import home from '../../assets/nav/home.svg';
import homeColored from '../../assets/nav/homeColored.svg'
import challenge from '../../assets/nav/challenge.svg';
import challengeColored from '../../assets/nav/challengeColored.svg';
import community from '../../assets/nav/community.svg';
import communityColored from '../../assets/nav/communityColored.svg';
import shop from '../../assets/nav/shop.svg';
import shopColored from '../../assets/nav/shopColored.svg';
import map from '../../assets/nav/map.svg';
import mapColored from '../../assets/nav/mapColored.svg';


function Header() {
    const location = useLocation();

    const navItems = [
        { path: '/', label: '홈', icon: home, activeIcon: homeColored },
        { path: '/challenge', label: '챌린지', icon: challenge, activeIcon: challengeColored},
        { path: '/community', label: '커뮤니티', icon: community, activeIcon: communityColored },
        { path: '/store', label: '쇼핑몰', icon: shop, activeIcon: shopColored },
        { path: '/map', label: '식당 지도', icon: map, activeIcon: mapColored },
    ];

    return (
        <header className="bg-white backdrop-blur-sm border-b border-teal-100/50 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="w-full h-20 px-4 pr-8">
                <div className="h-full flex items-center">

                    {/* 로고 - 고정 너비 */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0 ml-4 w-[200px]">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl shadow-sm flex justify-center items-center">
                            <img src={logoImg} alt="veganing" className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-nunito text-primary-dark ml-1">Veganing</span>
                    </Link>

                    {/* 네비게이션 - 가운데 정렬 */}
                    <nav className="flex-1 flex justify-center items-center gap-3">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        px-4 h-11 rounded-2xl
                                        flex items-center gap-2
                                        font-nunito text-base
                                        transition-all duration-200
                                        ${isActive
                                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg'
                                            : 'text-teal-600 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {/* 아이콘 이미지 */}
                                    <img
                                        src={isActive ? item.icon : item.activeIcon}
                                        alt=""
                                        className={`${['/community'].includes(item.path) ? 'w-6 h-6' : 'w-4 h-4'}`}
                                    />

                                    {/* 텍스트 */}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* 로그인 - 고정 너비 */}
                    <div className="w-[200px] flex justify-end">
                        <button className="px-4 h-9 bg-white rounded-2xl shadow-sm border-2 border-cyan-500 text-teal-600 text-sm font-medium font-nunito hover:bg-gray-50 transition-colors">
                            로그인
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
}

export default Header;