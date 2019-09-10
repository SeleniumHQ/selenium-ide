// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

process.versions = JSON.parse(`
{
    "http_parser": "2.8.0",
    "node": "10.4.0",
    "v8": "6.7.288.43-node.7",
    "uv": "1.20.3",
    "zlib": "1.2.11",
    "ares": "1.14.0",
    "modules": "64",
    "nghttp2": "1.29.0",
    "napi": "3",
    "openssl": "1.1.0h",
    "icu": "61.1",
    "unicode": "10.0",
    "cldr": "33.0",
    "tz": "2018c"
}
`)

// eslint-disable-next-line node/no-deprecated-api
process.binding = name => {
  if (name === 'constants') {
    return JSON.parse(`
    {
    "os": {
        "UV_UDP_REUSEADDR": 4,
        "dlopen": {
            "RTLD_LAZY": 1,
            "RTLD_NOW": 2,
            "RTLD_GLOBAL": 8,
            "RTLD_LOCAL": 4
        },
        "errno": {
            "E2BIG": 7,
            "EACCES": 13,
            "EADDRINUSE": 48,
            "EADDRNOTAVAIL": 49,
            "EAFNOSUPPORT": 47,
            "EAGAIN": 35,
            "EALREADY": 37,
            "EBADF": 9,
            "EBADMSG": 94,
            "EBUSY": 16,
            "ECANCELED": 89,
            "ECHILD": 10,
            "ECONNABORTED": 53,
            "ECONNREFUSED": 61,
            "ECONNRESET": 54,
            "EDEADLK": 11,
            "EDESTADDRREQ": 39,
            "EDOM": 33,
            "EDQUOT": 69,
            "EEXIST": 17,
            "EFAULT": 14,
            "EFBIG": 27,
            "EHOSTUNREACH": 65,
            "EIDRM": 90,
            "EILSEQ": 92,
            "EINPROGRESS": 36,
            "EINTR": 4,
            "EINVAL": 22,
            "EIO": 5,
            "EISCONN": 56,
            "EISDIR": 21,
            "ELOOP": 62,
            "EMFILE": 24,
            "EMLINK": 31,
            "EMSGSIZE": 40,
            "EMULTIHOP": 95,
            "ENAMETOOLONG": 63,
            "ENETDOWN": 50,
            "ENETRESET": 52,
            "ENETUNREACH": 51,
            "ENFILE": 23,
            "ENOBUFS": 55,
            "ENODATA": 96,
            "ENODEV": 19,
            "ENOENT": 2,
            "ENOEXEC": 8,
            "ENOLCK": 77,
            "ENOLINK": 97,
            "ENOMEM": 12,
            "ENOMSG": 91,
            "ENOPROTOOPT": 42,
            "ENOSPC": 28,
            "ENOSR": 98,
            "ENOSTR": 99,
            "ENOSYS": 78,
            "ENOTCONN": 57,
            "ENOTDIR": 20,
            "ENOTEMPTY": 66,
            "ENOTSOCK": 38,
            "ENOTSUP": 45,
            "ENOTTY": 25,
            "ENXIO": 6,
            "EOPNOTSUPP": 102,
            "EOVERFLOW": 84,
            "EPERM": 1,
            "EPIPE": 32,
            "EPROTO": 100,
            "EPROTONOSUPPORT": 43,
            "EPROTOTYPE": 41,
            "ERANGE": 34,
            "EROFS": 30,
            "ESPIPE": 29,
            "ESRCH": 3,
            "ESTALE": 70,
            "ETIME": 101,
            "ETIMEDOUT": 60,
            "ETXTBSY": 26,
            "EWOULDBLOCK": 35,
            "EXDEV": 18
        },
        "signals": {
            "SIGHUP": 1,
            "SIGINT": 2,
            "SIGQUIT": 3,
            "SIGILL": 4,
            "SIGTRAP": 5,
            "SIGABRT": 6,
            "SIGIOT": 6,
            "SIGBUS": 10,
            "SIGFPE": 8,
            "SIGKILL": 9,
            "SIGUSR1": 30,
            "SIGSEGV": 11,
            "SIGUSR2": 31,
            "SIGPIPE": 13,
            "SIGALRM": 14,
            "SIGTERM": 15,
            "SIGCHLD": 20,
            "SIGCONT": 19,
            "SIGSTOP": 17,
            "SIGTSTP": 18,
            "SIGTTIN": 21,
            "SIGTTOU": 22,
            "SIGURG": 16,
            "SIGXCPU": 24,
            "SIGXFSZ": 25,
            "SIGVTALRM": 26,
            "SIGPROF": 27,
            "SIGWINCH": 28,
            "SIGIO": 23,
            "SIGINFO": 29,
            "SIGSYS": 12
        }
    },
    "fs": {
        "UV_FS_SYMLINK_DIR": 1,
        "UV_FS_SYMLINK_JUNCTION": 2,
        "O_RDONLY": 0,
        "O_WRONLY": 1,
        "O_RDWR": 2,
        "S_IFMT": 61440,
        "S_IFREG": 32768,
        "S_IFDIR": 16384,
        "S_IFCHR": 8192,
        "S_IFBLK": 24576,
        "S_IFIFO": 4096,
        "S_IFLNK": 40960,
        "S_IFSOCK": 49152,
        "O_CREAT": 512,
        "O_EXCL": 2048,
        "O_NOCTTY": 131072,
        "O_TRUNC": 1024,
        "O_APPEND": 8,
        "O_DIRECTORY": 1048576,
        "O_NOFOLLOW": 256,
        "O_SYNC": 128,
        "O_DSYNC": 4194304,
        "O_SYMLINK": 2097152,
        "O_NONBLOCK": 4,
        "S_IRWXU": 448,
        "S_IRUSR": 256,
        "S_IWUSR": 128,
        "S_IXUSR": 64,
        "S_IRWXG": 56,
        "S_IRGRP": 32,
        "S_IWGRP": 16,
        "S_IXGRP": 8,
        "S_IRWXO": 7,
        "S_IROTH": 4,
        "S_IWOTH": 2,
        "S_IXOTH": 1,
        "F_OK": 0,
        "R_OK": 4,
        "W_OK": 2,
        "X_OK": 1,
        "UV_FS_COPYFILE_EXCL": 1,
        "UV_FS_COPYFILE_FICLONE": 2,
        "UV_FS_COPYFILE_FICLONE_FORCE": 4,
        "COPYFILE_EXCL": 1,
        "COPYFILE_FICLONE": 2,
        "COPYFILE_FICLONE_FORCE": 4
    },
    "crypto": {
        "OPENSSL_VERSION_NUMBER": 269484175,
        "SSL_OP_ALL": 2147485780,
        "SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION": 262144,
        "SSL_OP_CIPHER_SERVER_PREFERENCE": 4194304,
        "SSL_OP_CISCO_ANYCONNECT": 32768,
        "SSL_OP_COOKIE_EXCHANGE": 8192,
        "SSL_OP_CRYPTOPRO_TLSEXT_BUG": 2147483648,
        "SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS": 2048,
        "SSL_OP_EPHEMERAL_RSA": 0,
        "SSL_OP_LEGACY_SERVER_CONNECT": 4,
        "SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER": 0,
        "SSL_OP_MICROSOFT_SESS_ID_BUG": 0,
        "SSL_OP_MSIE_SSLV2_RSA_PADDING": 0,
        "SSL_OP_NETSCAPE_CA_DN_BUG": 0,
        "SSL_OP_NETSCAPE_CHALLENGE_BUG": 0,
        "SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG": 0,
        "SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG": 0,
        "SSL_OP_NO_COMPRESSION": 131072,
        "SSL_OP_NO_QUERY_MTU": 4096,
        "SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION": 65536,
        "SSL_OP_NO_SSLv2": 0,
        "SSL_OP_NO_SSLv3": 33554432,
        "SSL_OP_NO_TICKET": 16384,
        "SSL_OP_NO_TLSv1": 67108864,
        "SSL_OP_NO_TLSv1_1": 268435456,
        "SSL_OP_NO_TLSv1_2": 134217728,
        "SSL_OP_PKCS1_CHECK_1": 0,
        "SSL_OP_PKCS1_CHECK_2": 0,
        "SSL_OP_SINGLE_DH_USE": 0,
        "SSL_OP_SINGLE_ECDH_USE": 0,
        "SSL_OP_SSLEAY_080_CLIENT_DH_BUG": 0,
        "SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG": 0,
        "SSL_OP_TLS_BLOCK_PADDING_BUG": 0,
        "SSL_OP_TLS_D5_BUG": 0,
        "SSL_OP_TLS_ROLLBACK_BUG": 8388608,
        "ENGINE_METHOD_RSA": 1,
        "ENGINE_METHOD_DSA": 2,
        "ENGINE_METHOD_DH": 4,
        "ENGINE_METHOD_RAND": 8,
        "ENGINE_METHOD_EC": 2048,
        "ENGINE_METHOD_CIPHERS": 64,
        "ENGINE_METHOD_DIGESTS": 128,
        "ENGINE_METHOD_PKEY_METHS": 512,
        "ENGINE_METHOD_PKEY_ASN1_METHS": 1024,
        "ENGINE_METHOD_ALL": 65535,
        "ENGINE_METHOD_NONE": 0,
        "DH_CHECK_P_NOT_SAFE_PRIME": 2,
        "DH_CHECK_P_NOT_PRIME": 1,
        "DH_UNABLE_TO_CHECK_GENERATOR": 4,
        "DH_NOT_SUITABLE_GENERATOR": 8,
        "ALPN_ENABLED": 1,
        "RSA_PKCS1_PADDING": 1,
        "RSA_SSLV23_PADDING": 2,
        "RSA_NO_PADDING": 3,
        "RSA_PKCS1_OAEP_PADDING": 4,
        "RSA_X931_PADDING": 5,
        "RSA_PKCS1_PSS_PADDING": 6,
        "RSA_PSS_SALTLEN_DIGEST": -1,
        "RSA_PSS_SALTLEN_MAX_SIGN": -2,
        "RSA_PSS_SALTLEN_AUTO": -2,
        "POINT_CONVERSION_COMPRESSED": 2,
        "POINT_CONVERSION_UNCOMPRESSED": 4,
        "POINT_CONVERSION_HYBRID": 6,
        "defaultCoreCipherList": "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
        "defaultCipherList": "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
        "INT_MAX": 2147483647
    },
    "zlib": {
        "Z_NO_FLUSH": 0,
        "Z_PARTIAL_FLUSH": 1,
        "Z_SYNC_FLUSH": 2,
        "Z_FULL_FLUSH": 3,
        "Z_FINISH": 4,
        "Z_BLOCK": 5,
        "Z_OK": 0,
        "Z_STREAM_END": 1,
        "Z_NEED_DICT": 2,
        "Z_ERRNO": -1,
        "Z_STREAM_ERROR": -2,
        "Z_DATA_ERROR": -3,
        "Z_MEM_ERROR": -4,
        "Z_BUF_ERROR": -5,
        "Z_VERSION_ERROR": -6,
        "Z_NO_COMPRESSION": 0,
        "Z_BEST_SPEED": 1,
        "Z_BEST_COMPRESSION": 9,
        "Z_DEFAULT_COMPRESSION": -1,
        "Z_FILTERED": 1,
        "Z_HUFFMAN_ONLY": 2,
        "Z_RLE": 3,
        "Z_FIXED": 4,
        "Z_DEFAULT_STRATEGY": 0,
        "ZLIB_VERNUM": 4784,
        "DEFLATE": 1,
        "INFLATE": 2,
        "GZIP": 3,
        "GUNZIP": 4,
        "DEFLATERAW": 5,
        "INFLATERAW": 6,
        "UNZIP": 7,
        "Z_MIN_WINDOWBITS": 8,
        "Z_MAX_WINDOWBITS": 15,
        "Z_DEFAULT_WINDOWBITS": 15,
        "Z_MIN_CHUNK": 64,
        "Z_MAX_CHUNK": null,
        "Z_DEFAULT_CHUNK": 16384,
        "Z_MIN_MEMLEVEL": 1,
        "Z_MAX_MEMLEVEL": 9,
        "Z_DEFAULT_MEMLEVEL": 8,
        "Z_MIN_LEVEL": -1,
        "Z_MAX_LEVEL": 9,
        "Z_DEFAULT_LEVEL": -1
    }
    }
    `)
  }
}
