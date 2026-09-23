package org.example.traveljavaserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.example.traveljavaserver.entity.PostComment;

@Mapper
public interface PostCommentMapper extends BaseMapper<PostComment> {
}
