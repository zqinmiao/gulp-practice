/**
 * Created by Mark Zhang on 2017/9/06.
 */

import gulp from 'gulp';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import less from 'gulp-less';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import cleanCss from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import del from 'del';
import sequence from 'gulp-sequence';
import rename from 'gulp-rename';
import ejs from 'gulp-ejs';
import rev from 'gulp-rev';
import revCollector from 'gulp-rev-collector';

// 清理目录
gulp.task('clean', () => del(['./dist/*','./src/views/*'], {dot: true}));

//copy 复制文件
gulp.task('copy', () => gulp.src(['./src/js/lib/jquery.min.js',
    './src/js/lib/bootstrap-datetimepicker.min.js',
    './src/js/lib/template.js'])
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('./dist/js'))
);

//image 压缩图片
gulp.task('image', () => gulp.src('./src/images/**/*')
    .pipe(imagemin({
        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
        optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
        use: [pngquant()]
    }))
    .pipe(gulp.dest('./dist/images'))
)

//ejs文件输出为html
gulp.task('postejs', () => gulp.src(['./src/views/*.ejs'])
    .pipe(ejs({}, {}, {ext: '.html'}))
    .pipe(gulp.dest('./dist/'))
);

//css 处理less
gulp.task('postcss', function () {
    return gulp.src('./src/css/style.less')
        .pipe(less())
        .pipe(autoprefixer({browsers: [
            'ie >= 9',
            'ie_mob >= 10',
            'ff >= 30',
            'chrome >= 34',
            'safari >= 7',
            'opera >= 23',
            'ios >= 7',
            'android >= 2.3',
            'bb >= 10'
        ]}))
        .pipe(cleanCss())
        .pipe(rev())
        .pipe(gulp.dest('./dist/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'))
});

//uglifyjs 压缩js
gulp.task('uglifyjs', () => gulp.src('./src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rev())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('rev/js'))
);

//静态资源版本控制
gulp.task('rev',() =>gulp.src(['rev/**/*.json','./src/templates/**/*.ejs'])
    .pipe(revCollector({
        replaceReved:true
    }))
    .pipe(gulp.dest('./src/views'))
)

/*
* 执行watch
* */
gulp.task('execEjs',(cb) => sequence('rev','postejs',cb))
gulp.task('execCss',(cb) => sequence('postcss','execEjs',cb))
gulp.task('execJs',(cb) => sequence('uglifyjs','execEjs',cb))

// watch 监控
gulp.task('watch', () => {
    gulp.watch('./src/templates/**/*.ejs',['execEjs']);
    gulp.watch('./src/css/**/*.less',['execCss']);
    gulp.watch('./src/js/*.js',['execJs']);
});

//build
gulp.task('build', (cb) => sequence('copy', 'image', 'postcss', 'uglifyjs','rev','postejs', cb));

//default
gulp.task('default', (cb) => sequence('clean', 'build', cb));

//dev
gulp.task('dev', ['build', 'watch'], (cb) => (cb));
