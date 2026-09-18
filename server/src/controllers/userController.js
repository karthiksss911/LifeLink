export async function getMe(req, res) {
    return res.json({
        success: true,
        user: req.user,
    });
}