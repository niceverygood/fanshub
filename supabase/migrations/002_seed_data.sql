-- FansHub Sample Data
-- Run this after 001_initial_schema.sql

-- Insert sample users
INSERT INTO public.users (id, email, username, name, avatar_url, cover_url, bio, is_creator, is_verified) VALUES
  ('11111111-1111-1111-1111-111111111111', 'fina@example.com', 'soofina', 'Fina', 
   'https://images.unsplash.com/photo-1551929175-f82f676827b8?w=400', 
   'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?w=1200',
   '가라지어 록음니다 🎸 | 음악과 일상을 공유해요', true, true),
  
  ('22222222-2222-2222-2222-222222222222', 'earthly@example.com', 'earthlyworm', 'EARTHLY ALIEN',
   'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?w=400',
   'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?w=1200',
   '외계에서 온 지구인 👽 | 일러스트레이터', true, true),
   
  ('33333333-3333-3333-3333-333333333333', 'ash@example.com', 'ashtype', 'ash',
   'https://images.unsplash.com/photo-1646528192559-c163a2803f52?w=400',
   'https://images.unsplash.com/photo-1646528192559-c163a2803f52?w=1200',
   '모델 & 포토그래퍼 📸', true, false),
   
  ('44444444-4444-4444-4444-444444444444', 'astrid@example.com', 'astridamp', 'Astrid',
   'https://images.unsplash.com/photo-1642263039799-7515d7143225?w=400',
   'https://images.unsplash.com/photo-1642263039799-7515d7143225?w=1200',
   '패션 & 라이프스타일 크리에이터 ✨', true, true),

  ('55555555-5555-5555-5555-555555555555', 'user@example.com', 'yourname', 'Your Name',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
   'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?w=1200',
   '안녕하세요! 저의 페이지에 방문해 주셔서 감사합니다. 다양한 콘텐츠를 공유하고 있어요 💕', true, true);

-- Insert subscription tiers for Fina
INSERT INTO public.subscription_tiers (creator_id, name, price, description, benefits, tier_level) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Basic', 4.99, '기본 구독', 
   ARRAY['모든 일반 피드 접근', '댓글 작성 가능', '월간 뉴스레터'], 1),
  ('11111111-1111-1111-1111-111111111111', 'Silver', 9.99, '실버 구독', 
   ARRAY['Basic 혜택 모두 포함', '실버 전용 콘텐츠', '주간 비하인드 스토리'], 2),
  ('11111111-1111-1111-1111-111111111111', 'Gold', 19.99, '골드 구독', 
   ARRAY['Silver 혜택 모두 포함', '골드 전용 콘텐츠', '1:1 DM 가능', '라이브 참여권'], 3),
  ('11111111-1111-1111-1111-111111111111', 'Platinum', 49.99, '플래티넘 구독', 
   ARRAY['Gold 혜택 모두 포함', '플래티넘 전용 콘텐츠', '개인 영상 메시지', 'VIP 이벤트 초대'], 4);

-- Insert subscription tiers for EARTHLY ALIEN
INSERT INTO public.subscription_tiers (creator_id, name, price, description, benefits, tier_level) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Fan', 12.99, '팬 구독',
   ARRAY['모든 일러스트 접근', '작업 과정 공유', '월간 배경화면'], 1);

-- Insert subscription tiers for ash
INSERT INTO public.subscription_tiers (creator_id, name, price, description, benefits, tier_level) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Standard', 8.99, '스탠다드 구독',
   ARRAY['화보 미공개컷', '촬영 비하인드', '포토 팁 공유'], 1);

-- Insert subscription tiers for Astrid
INSERT INTO public.subscription_tiers (creator_id, name, price, description, benefits, tier_level) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Silver', 9.99, '실버 구독',
   ARRAY['패션 코디 팁', '할인 코드 공유'], 2),
  ('44444444-4444-4444-4444-444444444444', 'Gold', 19.99, '골드 구독',
   ARRAY['Silver 혜택 모두 포함', '1:1 스타일링 상담'], 3),
  ('44444444-4444-4444-4444-444444444444', 'Platinum', 39.99, '플래티넘 구독',
   ARRAY['Gold 혜택 모두 포함', '개인 쇼핑 동행'], 4);

-- Insert sample feeds
INSERT INTO public.feeds (id, creator_id, content_text, media_urls, media_type, is_premium, price, like_count, comment_count) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'There''s room for two in here. Consider this your invitation. 🎭',
   ARRAY['https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?w=800'],
   'image', true, 15, 108, 27),
   
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   '새로운 포토세트가 준비되었어요 ✨ 특별한 순간들을 담았습니다',
   ARRAY['https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?w=800'],
   'image', true, 25, 89, 15),
   
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111',
   '새로운 뮤직비디오 티저가 나왔어요! 🎵 어떤가요?',
   ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'],
   'video', true, 12, 156, 42),
   
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111',
   'Do you like this color on me? 👗',
   NULL, NULL, false, NULL, 234, 67),
   
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333',
   '촬영 현장 비하인드! 🎬 처음 공개하는 메이킹 영상이에요',
   ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'],
   'video', true, 18, 178, 34),
   
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333',
   'Behind the scenes 🎬 이 사진들은 오직 여기서만!',
   ARRAY['https://images.unsplash.com/photo-1646528192559-c163a2803f52?w=800'],
   'image', true, 10, 92, 18);

-- Insert creator stats
INSERT INTO public.creator_stats (creator_id, total_subscribers, total_earnings, this_month_earnings, total_feeds, total_media) VALUES
  ('11111111-1111-1111-1111-111111111111', 1248, 12890, 3420, 156, 892),
  ('22222222-2222-2222-2222-222222222222', 523, 5420, 890, 89, 234),
  ('33333333-3333-3333-3333-333333333333', 876, 7230, 1560, 112, 456),
  ('44444444-4444-4444-4444-444444444444', 1567, 18900, 4230, 234, 1023),
  ('55555555-5555-5555-5555-555555555555', 1248, 12890, 3420, 156, 892);

-- Insert sample payment cards for test user
INSERT INTO public.payment_cards (user_id, last4, brand, exp_month, exp_year, cardholder_name, is_default) VALUES
  ('55555555-5555-5555-5555-555555555555', '1234', 'Visa', 12, 2025, 'Your Name', true),
  ('55555555-5555-5555-5555-555555555555', '5678', 'Mastercard', 8, 2026, 'Your Name', false);




