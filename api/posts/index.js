const { redis } = require('../../lib/redis');

const ORDER_KEY = 'board:order';
const CATEGORIES = ['공지사항', '상품 사용후기', '상품 Q&A', '이용안내 FAQ', '교환/반품 문의'];

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const ids = await redis.zrange(ORDER_KEY, 0, -1, { rev: true });
    if (!ids || !ids.length) return res.status(200).json({ posts: [] });

    const posts = await Promise.all(ids.map((id) => redis.hgetall(`board:post:${id}`)));
    const list = posts
      .filter(Boolean)
      .map((p) => ({
        id: p.id,
        category: p.category,
        title: p.title,
        nickname: p.nickname,
        createdAt: p.createdAt,
        views: p.views || 0,
      }));
    return res.status(200).json({ posts: list });
  }

  if (req.method === 'POST') {
    // `nickname` 은 이제 자유 입력 닉네임이 아니라 작성자의 로그인 아이디를 담는다.
    // 필드 이름은 이미 저장된 글들과의 호환을 위해 그대로 둔다.
    //
    // 주의: 프리뷰의 로그인은 sessionStorage 기반 목업이라 서버가 신원을 확인할 방법이
    // 없다. 로그인 강제는 브라우저 쪽에서만 이뤄지며, 이 엔드포인트로 직접 요청을 보내면
    // 아무 값이나 작성자로 넣을 수 있다. 실제 회원 인증은 카페24 게시판 모듈이 담당한다.
    const { category, title, nickname, content } = req.body || {};
    if (!title || !nickname || !content) {
      return res.status(400).json({ error: '제목, 작성자, 내용을 모두 입력해 주세요.' });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const createdAt = Date.now();
    const post = {
      id,
      category: CATEGORIES.includes(category) ? category : '상품 Q&A',
      title: String(title).slice(0, 200),
      nickname: String(nickname).slice(0, 40),
      content: String(content).slice(0, 5000),
      createdAt,
      views: 0,
    };

    await redis.hset(`board:post:${id}`, post);
    await redis.zadd(ORDER_KEY, { score: createdAt, member: id });

    return res.status(201).json({ post });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
};
