$(function() {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage;

    //定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(data) {
            const dt = new Date;
            var y = dt.getFullYear()
            var m = padZero(dt.getMonth() + 1)
            var d = padZero(dt.getDate())
            var hh = padZero(dt.getHours())
            var mm = padZero(dt.getMinutes())
            var ss = padZero(dt.getSeconds())

            return y + "-" + m + "-" + d + '' + hh + ":" + mm + ':' + ss
        }
        // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }
    //定义一个查询参数的对象 将来请求数据的时候 需要将请求对象提交到服务器
    var q = {
            pagenum: 1, //页码值 默认请求第一页的数据
            pagesize: 2, //每页几条数据 默认每页两条
            cate_id: '', // 文章分类的id
            state: '', //文章的发布状态
        }
        //
    initTable()
    initCate()

    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败')
                }
                //使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
                renderPage(res.total) //调用渲染分页的方法
            }
        })
    }
    //初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败')
                }
                //调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                console.log(htmlStr);
                $('[name=cate_id]').html(htmlStr);
                form.render();
                console.log(form);
            }
        })
    }
    //为筛选表单 绑定submit
    $('#form-sear').on('submit', function(e) {
            e.preventDefault()
                // 获取表单中选项的值
            var cate_id = $('[name=cate_id').val()
            var state = $('[name=state]').val()
                // 为查询参数对象q 中对应的属性赋值
            q.cate_id = cate_id
            q.state = state
                //根据最新的筛选条件重新渲染数据
            initTable();
        })
        //定义渲染分页的方法
    function renderPage(total) {
        laypage.render({
            elem: 'pageBox', //分页容器的id
            count: total, //总数据条数
            limit: q.pagesize, //每页显示几条数据
            curr: q.pagenum,
            layout: [
                'conut', 'limit', 'prev', 'page', 'next', 'skip'
            ],
            limits: [2, 4, 6, 10],
            //默认被选中的分页  选中第一页 
            //分页发生切换的时候 触发
            //触发jump的方式有 两种 
            //1. 点击页码的时候 会触发jump回调
            //2. 只要调用了laypage.render 就会触发jump回调
            // -----------
            // 可以通过first的值 来判断是通过那种方式 触发jump回调
            //如果first 的值为true 证明是方式2 
            //否则就是方式1 触发的
            jump: function(obj, first) {
                console.log(obj.curr);
                //把最新的页码值，赋值到q这个查询参数对象中
                q.pagenum = obj.curr
                    //把最新的条目数，赋值到 q这个/查询参数对象中 pagesizi属性中
                q.pagesize = obj.limit
                    // initTable() //根据最新的q 获取对应的数据列表 并渲染表格
                    // console.log(first);
                if (!first) {
                    initTable()
                }

            }
        })
    }
    //通过代理的方式，为删除按钮绑定点击事件
    $('body').on('click', '.btn-delete', function() {
        var len = $('.btn-delete').length //获取删除按钮的个数
            //获取到文章的自定义id
        var id = $(this).attr('data-id')
            //询问用户是否要删除数据
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function(index) {
            //do something
            $.ajax({
                method: 'GET',
                url: '/my/article.delete' + id,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.mag('删除文章失败')
                    }
                    layer.mag('删除文章成功')
                        //当数据删除完成之后 需要判断当前这一页中 是否还有剩余的数据
                        //如果没有剩余的数据了 则让页码值 -1 
                    if (len === 1) {
                        //如果len 的值 等于 1 删除完毕之后 页面上就没有任何数据了

                        //页码值最小是1 
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1

                    }
                    initTable()
                }
            })
            layer.close(index);
        });
    })
})