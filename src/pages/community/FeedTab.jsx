import React from "react";
import { Badge } from "./components/ui/Badge";
import { Button } from "./components/ui/Button";
import { Card, CardContent } from "./components/ui/Card";
import { Avatar, AvatarFallback } from "./components/ui/Avatar";
import { MapPinIcon, HeartIcon, MessageCircleIcon, Plus } from "lucide-react";

const FeedTab = ({
    feedPosts,
    challengeLoading,
    isLoggedIn,
    currentChallenge,
    goToChallenge,
    popularHashtags,
    onCreatePost,
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl ">
            <div className="lg:col-span-2 flex flex-col gap-6">
                {/* 게시글 생성 버튼 */}
                <Button
                    onClick={onCreatePost}
                    className="w-full bg-[#00a63e] text-white hover:bg-[#008235] [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-3 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    새 게시글 작성하기
                </Button>
                {feedPosts.map((post, index) => (
                    <Card
                        key={index}
                        className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-[#ececf0] text-neutral-950 [font-family:'Nunito',Helvetica] font-normal text-base">
                                            {post.avatar || ""}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base tracking-[0] leading-6">
                                                {post.username}
                                            </span>
                                            <Badge className="bg-green-100 text-[#008235] border-[0.67px] border-transparent [font-family:'Nunito',Helvetica] font-medium text-xs">
                                                {post.level}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-1 text-[#697282] text-sm">
                                            <MapPinIcon className="w-3 h-3" />
                                            <span className="[font-family:'Nunito',Helvetica] font-normal tracking-[0] leading-5">
                                                {post.location} • {post.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="ghost" size="icon" className="h-8 w-9">
                                    <img alt="Button" src={post.buttonIcon} />
                                </Button>
                            </div>

                            <p className="[font-family:'Nunito',Helvetica] font-normal text-[#354152] text-base tracking-[0] leading-6 mb-3">
                                {post.content}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.hashtags.map((tag, tagIndex) => (
                                    <Badge
                                        key={tagIndex}
                                        variant="outline"
                                        className="border-[#00a63e] text-[#00a63e] [font-family:'Nunito',Helvetica] font-medium text-xs"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button variant="ghost" className="h-auto p-0 flex items-center gap-2">
                                    <HeartIcon className="w-4 h-4 text-[#495565]" />
                                    <span className="[font-family:'Nunito',Helvetica] font-medium text-[#495565] text-sm tracking-[0] leading-5">
                                        {post.likes}
                                    </span>
                                </Button>

                                <Button variant="ghost" className="h-auto p-0 flex items-center gap-2">
                                    <MessageCircleIcon className="w-4 h-4 text-[#495565]" />
                                    <span className="[font-family:'Nunito',Helvetica] font-medium text-[#495565] text-sm tracking-[0] leading-5">
                                        {post.comments}
                                    </span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                <Card className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]">
                    <CardContent className="p-6 flex flex-col gap-[30px]">
                        <h3 className="text-[#00a63e] text-lg leading-7 [font-family:'Nunito',Helvetica] font-normal tracking-[0]">
                            이번 주 챌린지
                        </h3>

                        {challengeLoading ? (
                            <div className="flex flex-col gap-4 items-center py-8">
                                <div className="text-2xl">⏳</div>
                                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm">
                                    로딩 중...
                                </p>
                            </div>
                        ) : !isLoggedIn || !currentChallenge ? (
                            <div className="flex flex-col gap-4 items-center py-4">
                                <div className="text-4xl">🌱</div>
                                <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base text-center tracking-[0] leading-6">
                                    {!isLoggedIn ? "로그인하고 챌린지를 시작하세요!" : "새로운 챌린지를 시작해보세요!"}
                                </h4>
                                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                    {!isLoggedIn
                                        ? "비건 여정을 함께 시작해볼까요?"
                                        : "다양한 비건 챌린지에 도전해보세요!"}
                                </p>
                                <Button
                                    onClick={goToChallenge}
                                    className="w-full bg-[#00a63e] text-white [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-2 hover:bg-[#008235] transition-colors"
                                >
                                    챌린지 페이지로 이동
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="text-3xl text-center">
                                    {currentChallenge.difficulty === "easy"
                                        ? "🌱"
                                        : currentChallenge.difficulty === "medium"
                                        ? "🌿"
                                        : "🌳"}
                                </div>

                                <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base text-center tracking-[0] leading-6">
                                    {currentChallenge.title}
                                </h4>

                                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                    {currentChallenge.description || "비건 챌린지에 도전 중입니다!"}
                                </p>

                                <div className="flex items-center justify-between text-[#495565] text-sm">
                                    <span className="[font-family:'Nunito',Helvetica] font-normal tracking-[0] leading-5">
                                        진행률
                                    </span>
                                    <span className="[font-family:'Nunito',Helvetica] font-normal tracking-[0] leading-5">
                                        {currentChallenge.progress || 0}%
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-[#03021333] rounded-[22369600px] overflow-hidden">
                                    <div
                                        className="h-full bg-[#00a63e] transition-all duration-500"
                                        style={{ width: `${currentChallenge.progress || 0}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-center gap-4 text-sm">
                                    <span className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e]">
                                        ⭐ {currentChallenge.points || 0}pts
                                    </span>
                                    <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565]">
                                        난이도:{" "}
                                        {currentChallenge.difficulty === "easy"
                                            ? "쉬움"
                                            : currentChallenge.difficulty === "medium"
                                            ? "보통"
                                            : "어려움"}
                                    </span>
                                </div>

                                <Button
                                    onClick={goToChallenge}
                                    className="w-full bg-[#00a63e] text-white [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-2 hover:bg-[#008235] transition-colors"
                                >
                                    챌린지 상세보기
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]">
                    <CardContent className="p-6 flex flex-col gap-[30px]">
                        <h3 className="text-[#00a63e] text-lg leading-7 [font-family:'Nunito',Helvetica] font-normal tracking-[0]">
                            인기 해시태그
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {popularHashtags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="border-[#0000001a] text-neutral-950 [font-family:'Nunito',Helvetica] font-medium text-xs cursor-pointer hover:border-[#00a63e] hover:text-[#00a63e] transition-colors"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FeedTab;

