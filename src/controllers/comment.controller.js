import CommentService from '../services/comment.service';
import responseHandlers from '../utils/responseHandlers';
import statusCodes from '../utils/statusCodes';
import customMessages from '../utils/customMessages';
import { dbPage } from '../utils/comment.utils';

const { saveNewComment, getAllCommentOfSpecificReq, updateComment, deleteComment } = CommentService;
const { successResponse, errorResponse } = responseHandlers;
const { created, notFound, ok } = statusCodes;
const {
    commentAdded,
    commentUpdatedSuccess,
    commentDeleted,
    noCommentOnThisPage,
    noCommentYet,
    commentsRetrieved
} = customMessages;
/**
 * @description class CommentController handles all comments controllers methods
 */
export default class CommentController {
    /**
     * @param {object} req
     * @param {object} res
     * @returns {object} response to user
     * @description it will call comment service to save a new comment in db
     */
    static addNewComment = async (req, res) => {
        const { id } = req.sessionUser;
        const { requestId } = req.params;
        const { comment } = req.body;
        const savedComment = await saveNewComment({ userId: id, requestId, comment });
        successResponse(res, created, commentAdded, null, savedComment);
    }

    /**
     * @param {object} req
     * @param {object} res
     * @returns {object} response to user
     * @description it responds to user about the update result
     */
    static updateComments = async (req, res) => {
        const { commentId } = req.params;
        const { requestId, comment } = req.body;
        const commentData = { id: commentId, requestId, comment };
        const updatedCommentToReturn = await updateComment(commentData);
        successResponse(res, ok, commentUpdatedSuccess, null, updatedCommentToReturn[1]);
    }

    /**
     * @param {object} req
     * @param {object} res
     * @returns {object} response to user
     * @description it sends a response to user about the request
     */
    static getCommentSpecificReq = async (req, res) => {
        const { requestId, page } = req.query;
        const { limit, offset } = dbPage(page);
        const { foundComments, count } = await getAllCommentOfSpecificReq({
            requestId, offset, limit
        });
        if (count !== 0) {
            if (foundComments.length !== 0) {
                  const resultToSend = { commentNumber: count, foundComments };
                successResponse(res, ok, commentsRetrieved, null, resultToSend);  
            } else {
                errorResponse(res, notFound, noCommentOnThisPage);
                }
            } else {
                errorResponse(res, notFound, noCommentYet);
            }
    }
    
    /**
     * @param {object} req
     * @param {object} res
     * @returns {object} response
     * @description It returns response to user about deleted comment
     */
    static deleteComment = async (req, res) => {
        const { commentId } = req.params;
        await deleteComment(commentId);
        successResponse(res, ok, commentDeleted, null, null);
    }
}
