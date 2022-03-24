const { AuthenticationError, UserInputError } = require('apollo-server');

const checkAuth = require('../../util/check-auth');
const Post = require('../../models/Post');

module.exports = {
  Mutation: {
    //process postId and body
    createComment: async (_, { postId, body }, context) => {
      
      // import username from context after authorization 
      const { username } = checkAuth(context);
      
      // validate  input 
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not empty'
          }
        });
      }
      
      // find the post with postID and SAVE
      const post = await Post.findById(postId);
      
      //if existing post, add comment 
      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString()
        });
        await post.save();
        return post;
      } else throw new UserInputError('Post not found');
    },
    
    // DELETE 
    async deleteComment(_, { postId, commentId }, context) {
      
      // extract username 
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);
      // if there's a post, delete it 
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError('Action not allowed');
        }
      } else {
        throw new UserInputError('Post not found');
      }
    }
  }
};
