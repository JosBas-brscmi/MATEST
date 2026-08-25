import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LOGO = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAClAKUDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8qqKKKACiiigBe/XNAyTWx4f8M3/iS4aOziykfzSTOdscY9WbtXQPN4b8IDbbxL4j1MdZpRi1jP8Asr/H+NRKaTstWQ5dDB0bwlq2vHNnZySxDkyt8sY/4EeK2T4P0jSh/wATfxFbrIODb2CGd/8AvroKyNa8X6trw23d43kr923i+SJfoo4qDw4unS63ZjVXdNPMg85k+9tqHz2u3b0E+bqb8dz4Qgk2W+k6pqb9vOnCZ/BBWhbzQuP9G+HzuP8AbM0n9K9n8P2mjRWiNo8doYOzW+G/8erUOe9eJPGJPWL+9nFKv5Hg8jbRul+He1fYTLWdPc+GSSl94a1DTJD/ABQXB4/B1r6JqG9ht7iFheRxPFjnzwrLt/GlHGf3fxZKreX4nzx/wjnhrU/+Qf4ga0kPSHUodn/j68VS1XwHq+lwi4NsLq0/5+bRxKn5r0/GtL4oQ+HoNYjGhGPofPELZjDdtv8A9biua0nX9Q0GbzbC7mtnz/yzbg/UdDXtQc5RU4v7ztV5K6M4qVNJnn0rt4/EujeJwY9esFtbk9NSsE2tn/bTo1Zev+DbvRYVvIZI9R0pz+7vrf5k+jf3W9jWiqa2loy1Lozm6KMUVoWFFFFABRRRQAUUUUAOxzXU+HfCiXVo2q6tKbHRojy/8c7f3Ix3PvSeE/DkF1DLq+rFodGtT85H3p37Rp7102g6PefFPWRPcr9k0O0+RIYvlRF7Rp7+prlq1Ur66Ld/11MpSsQ2drq/xE26dpFsmj+HoWxtXhPq7dXer3i/4SWHhrwpPqCX08lzBtLeYAqPllGAP+Betew2Njb6ZaRW1rEsNvGMKiDgV5X8cfFC+XDodu25yRNcbe39xf6/lXmUsRUrVlCnpE5I1HOaUdjxo0U5kZGwQQ1NHWvdPQOj8F+HdY8T65Fp2hl1vJATuWXywoHUk+le/aL8BvFcMKfbPHEsDY5S2Dvt/wCBErXzjomvX/hzUYr7TLqSzu4+VliPIr1TTP2o/FVnEEubbT79l/5aSxFW/wDHSK9rA/2bb/bYNv8AA8TMKeOm/wDZWrfj+J6Ne/AvxHJHi38e3bH/AKaxMq/o1eLfE/wB4n8EyQnW7t7+0ndhFcJOzoSO2D0NdXcftVeJZUKw6bpcDeoR2/m9eb+MfiFrvjq4SXWL5rgR/wCriVQkcf0ArfG/2T7P/ZINT/D8THA0swhU/wBoa5fx/A5igdaKAD6V88fQnvfgz4deHtS8IWEs9kJ57mLfJNvIbPt6Vlat4F1fwJJPf6BKb/TmH+kWMy7wyf7S/wAa/rU3wR8VLPYSaHcP+9hZpLfPdD1H4H5vxr1Svm61atQrNS1ieZKcoTakfOmp+HrPxJZSat4eQo0Y3XemMdzw/wC0n95P5Vxh4Ne1/ELwZcaFd/8ACTeHybaWE77iKL9XUenqK4nXNNtvFemya9pUSw3MfOoWCf8ALNv+eiD+4f0r2KFdTin0/L1OunU5l5HEUUHg0V2HQFFFFAC881seGfD8viXVobONvLQ/PLKfuxxj7zGsfBJruLhx4R8FRW64XU9aXzJT/FHbj7q/8D61E5NKy3ZEn2DUJG8b6/YaFo6GLSrY+TbR+38cre5617zoujW2gaXb2NqmyGEYH95m/iLe9eU/ASxilu9UvDhriJEjRe4Vj8zfoK7bxj8StN8KwvGki3uoY+S3Q/d/3z2rw8Vz1KioQ6HDV5pPkiXfGni6HwnpnmY86+m+S2tx8xZ//ia1/hZ8GoNIJ8QeK1gvPEFwfOMVwylLXdz8w6b/AP0GuJ+A2g3Hj/xheeKtaxcR6eVEKEfIJj93C+ijn67a+/Ph14kl0nwz4PtnuNMuLD+1dQ/tOC+1IQ/ZrWRgNxiLr5nDOQGRwT2r6HD0p5LRp4vkU3Nvfyse9keU4XOqlbCVpuPIlflaV7pu12n2+bZ+efxh8BeIfFvxH1S40rRWe1jSNEkjKKJBs+915+63/fNcPJ8HfGERj36LLh5FhG2RD87nCjr6196/BdrDw78dNS8jV47TS4bS7hh1KYeWoBinEbY9TxgL+FQ/HafTJ7nwZFYXC6/5MNl9o8QEhZ9Qd587ZV6oycrh+cEVx1cZUrYjmlH4rP70n+p+g0+FMvo0HCNSXu3Sem0ZSir6b2itL3u9rJnwmnwZ8ZnGNGfngfvY/wD4qmxfB7xhdx+YujSCPc8eWdF5QlW6n1U1+k+p6roWs67qs0lzaL8MV0Ty9M0VCBNHcmMBVEP30mSTcTJjkdyCazP2YPGPhyx0nVdL8ZMP7Psr+e+sPNXKM8rzW84H/AJA31WuSGLqSg5tLdL8/wDLQ6q3CuCp1IRhKcrxcmtL7xSW26v7y6dz86v+FOeL1uEhOiyh3VnHzpjAIB5z/tL+dFx8HvF9pBNPJo0qxwqXf50JVQMnjNfb/wASEg8cfFuw0Wwukt9HtIjpFneXDBI0tomto/NLnjHDHPeun/aZ/wCEf8V+FYdf0TUYLy60y3udHvE2NHPJDHG3kSuH5fjKFxxyK1+sVHOEbb2/F20F/qvlyo1JyqSuubtZWipR5tOruuh+f7/BXxoJMHRJVPoXT/GvUf2f/BuoaDres2WvaAggmjRPOuVjcRvt37P+BI4NfW3gPx1b6b4E1C41CeVPEHhO4un0CBkOZ0ulMZH+0I33N/wOuc/Z91OfSPGHi+5FzDbXDaRJGgu7jyBLMba2wm8kbTnnqOlVhMyrUJusoq8dfxt/mPMOCMC4KlKpKzbW66JyVtO3Lrru10PAfiP8CYIH/t7wWY7LVLZ1kNijjY7f7Hofboah8HeL4fFNmwZfs+pQfJc2x+UqfX/dr2/4qa3qEmo2F5r0mnWlzJHb24+yX/2obgXADyM7/OfTea8G/aB8KS+GLyz8baKzWtwZBDeCPoSR8rke+MH8K9yvg/7ZwH1+MVCavdLbc/Jc+wFHI80WVxqOcbJptpu7V7XWjXY6tlEispAZW+Uq3evA/FNlcfDLxuLmxH+hy/vY0b7rxn78Z9u35V3XhT4x6XqsSQ6ow0676GQ/6t/x7fjXN/GvXtL1aLTI7G8hvJoi5YwsrqgOOMivkcLTq0qvJOOjPPpRnCXK0ch4z0O2tHt9U03J0m/XfF/0yf8AjjPutctk12fgi5j1i0u/DN04WO9/eWrt/wAs7gD5f++vu1yVxA9tM8UilJEYqynsRXuQbXuvod8ezIKKKK0LNzwjo/8Ab3iGysj8sTvmVv7qDlj+Qo8X62fEGv3d2nywbtkK/wB2IcIPyrX8ID+zPDfiPV+kohWyib/akPP/AI6rVk23hHVrzRZNVhsnksI85mUjt1OOpFY3XO2+mhndXuzIhuZbdiYpHjJ67G21GWLHJOTTcc0VsaHf+C/i9rngXQLzS9MaCJLiQS+c8e50OMcduw61zs/jTX5pWlfWtR3Ock/an/xrEyTSknvzXRKvVlFQlJ2WxnGlCnJzirNm/Y67q0hnuX1m+iBwHkE7l3PYdeau3Wo6rJp8DPrF/NcmRH8s3DYTP3O/Xj8K5iK8lgjeONyqP1HrT/7RuSsQ859sX+rGfu/Sto1oKNpXE1UbumdrPqGqw6lb27azqvyqTOPtT7sDuvPGe1U7O91CI3SJrt/HAjN5QiuHG+TBbnnA9zXJ/aZSPvtjGzr29KI7ueGJ4kkZY5PvKDw1bPEU278n4+WxCjVS+I6p9Q1SPS49Qm1TUBdP8sMn2luVz93rn3/KmX97rMUFvHc61fSJcZSSEXDPj227uetcyt5MrA+Y2Rgjn06U1LuWN0ZZCGRt6n0PrUOvSf2X06/e/mNKp/MdWmvX8E8qHX9UnhhU52XLpz0AHzHvSG91WGOFodZv/tdw487Fw6gZGV+bdycdfSuWF3LskXedshyw9ac97cSCMPLIRGMJlvuj2o9vC3w/19/b9QtUv8RveILu9Mciz6teX0AlAhE8jMH4zuwT7j86q33jXXNU0hNLutVu7jTkIItpZSyDHTisme7luFRZJC6xjCA9hUNYVK3vN09Eyowuk56sbRRQBzXKali1uZLS4iniYpJGwdWHYiuo+IMKXV5Za3AoWHVYBMyj+GYfLKP++v51lnwjqw0P+1/sMn9n/wDPbjp6464962LU/wBrfDW8iJ3S6XdJMv8A1zk+U/8Aj2Kxk1dSXoZt6po4uiiitjQ7hoGX4faNZx/f1DUZH+uAEFe+6dpkOnaXb2CKDDFEI8f3hjDV41Y26yXHw7gPTmUj/trn+le4V87jaj91ev5nmV2fLviDQpLHxXeaVChdxcmKJB1OT8o/UVsfEP4Yav8ADdrAamYXW8jLo0JJVWH3kOR1GRXoWl6HHqH7RlhvQFBtuyv+0kW5f1UV2n7VFqs3gbT5j9+O9GG+qNX3eBwSxGWzxUt1t+Fzkq4+VPGUcOtpLU+U6B1ooHWvGPeOy8HfDHXvHVnPdaTBFJFBJ5bmWVU+bGe9XfE3wZ8TeF9FuNUv7aBLWDb5hS4RyMsF6A+pr1X9mD/kVdY/6/F/9Ar0H4mWH9pfD/XoCuW+xu4X3HI/lXwmKz3E0My+rWXJdLztp5nuUsFTnh/adbHzZoXwS8U+I9ItdTsraBra4XfGXuEUsM46VleM/htrngSG1l1aGKJLgsI/KlV+R9K+svAll/Z/gzQ7fGGjsoQfrsGa8q/al/5BWgf9dZf5LRg8+xOKzFYZ25G366X8xVsFCnQ9p1PnfrXdeGfg54l8WaNDqenW0L2kxYIXnVC2G2ng+4rhQeQK+zPhNZHT/hvoEWNubfzG/wCBsT/WvbzvMKmXYeM6VuZvqcmDoRrzakfOPiH4K+KPDOjXWqX1tAtpbqGkMdwjkAkDoD71wGMmvtfxpAniD4f6usXzpcWDvH7/ACbh/SvirofxqckzGrmFKcq1uZPoGMoRoSXJsxlFFFfRHnnXfD34d6l8R9VlsNOaKMxRmR5ZywRR2zgHqazh4burfxUuh3MZiu1uhbOv907sGvdv2S7NBYeI7rHz+ZDFn2w5qj8R9Fjtv2htOmVAFuYkuT7sEYf+yivaxOCjSytYxb6/r/keHHHyljqmGeyR2X9m2/8AZv8AZ/lj7J5Pk7O2zGNteC+E9Pey1rxNojHO+yuYfqycqf8Ax2voOvF3j8j43zxjpK0gP4wmvgcHN++vK/3HTQe6PJz1op86+XI6/wB1iKK+kPTPT9PlCah8O5T90oYvx80j+te3V89yXfleDvC+oIcvYX0sZHpyr19A28yXUMUsZDJKFcN/smvmsbH4X6/meZXWxxvhi9jT9oy3iJGTaNGP97ySa1/2rdRSLwto9hn97PdNLt/2UTH83FeJ6r4zn034mz6/YkNJbXe+LP3WCfLj6ECl+KHxJuviXr0d9NCLW3hj8uG3DZ2DqTn1NfoGCxsKGUvCv4n/AMD/ACOOWBlPG08R0ivxOIooorxD3z6U/Zh/5FXV/wDr7X/0CvUY5k1W713TpfmCFIyv+w8I/wDr15d+zB/yKusf9fa/+gV2mhXxX4p+KrPPDWtpMv4KR/7NX5BmtPnx+Jkt4pP8Yn1WFdqFP+u5vS3AstR0jT0PyvHJt+kaAf1FeRftS/8AIK0D/rrL/wCgrXoGo3pk+LGj2meItLnkK/V0H/stcB+1KP8AiV+H/wDrrL/6CtVlFL2eYYaX8yb/ADHi3zUJ/wBdj55jUsygdSa+3Ao0PwRtHyfZNN/8eEdfGvhewOp+JdKs8Z8+7ii/76cCvt7UIbaeyuIrsI1o6EShztTZ3z7V73FNRKdCEu7f5HDlsdJyMD4fy/2r8PdELfN5likTflsr431S1NlqN3bkY8mVk/I4r7g0SCwstMgh0vyRYRjEQt33IBu7NXyB8VtP/sz4h6/AFKr9qd1Hs/zj/wBCqeG60ZYvERj11/H/AII8xhanBnI0UUV+gngn0V+yXqShvEVgT87CG4Uf7u4f+zVc+KV4n/C+fD8IPKWao347zXivw48c3fw88Sw6tbRicKrRzQsdolQ9Vz+R/CreqfEG48Q/EiPxLdKsObhG8tTkRxjjb+Ve5XxsKmU/U/tX/Dc+f+oTjj54lbNfjsfRNeMzN5vxxkI/5Zs+fwhNey+YmzfkbMbt38OK8G8O6iNQ8beIdYH+ritrq4De2ML/ADr8+wcfjl5HbQW7PPZ33TSH1cn9aKjPWivpEemdp4fzqvgXX7AfNLaPHfxD2HyP+hH5VZ034r6ppfhZtIREZwvlxXRJ3xp/dA/kayPAWqx6X4jt/tH/AB6XINtP/uPx/gfwrM1/S5ND1i7sZR88EhT6jsfyrndOE5OE15mXKpOzMwnJop6RPLnapbAycCmYrpNRcClA963pvA+uW+iRazJpdyulycpdGM7CPX6VgYx1FaThKPxKxEZKWzPWvhB8W9N+HmkX9peWVzctcTiQNDtwo247mr1t8btNt/ife+JBY3f2G5sxbNDlPM3Dbz1xj5a8Y5NHT3rxZ5VhalSpWlHWas9f67HcsTUjFQXQ9pHxw0xviafEb2N2bMWP2RIMrvBznd1xS+NvjRofizWPD1w+kXD2mn3DS3EFwEcTKR93b0/OvFu1AyTSWUYSM41EneKstemw/rdRpx7ney+NdFX4o2/iK10x7TSYpklW0iREZcDsBx1r0PxZ+0PpGu+GNT02302+imu7d4UkkKYBbuea+fqKqtlWFrzpzqJ+5a2vYmGJqQTiup7d8NvjnpfgrwlbaTe2F3cTwu7eZCV24LZHU1T8Y/Fjwt4m0zXVTw+/9p34XyrydI2eMgAfe69u1eOjJoNQsowsa8q8U1Ju+773K+tVeTkewh4NGTRjNen/AA5+A+t+PbL7c0iaXp7f6u4uEJMn+6O496+hoUKuIlyUo3Z5tavToR56jsjy8nNA61b1KybTr+6tSwdoJGiLDocHFVKwa5dDVO+p3p+K+qf8In/Y2xfN8vyftm47/L9MevbNVdEP9mfD/XLw8PezR2Mf0Hzv/wCy1xyqXYDGTXY+OT/Y+n6P4fU/NaQ+dcD/AKbSfMw/4CNorkdOMGoQW7uZOKWiOMPWiiiuk2HKdrV2vihP+En8N2Gvx/NdQAWd8P8AaH3H/EfyriTmuk8Ga/Ho2oyQ3imXS71Ps90n+wf4/qvWs5p/Et0RJdUej/AZrdtL1Vdq/aRKm5v4tmOP/Zq2/G/wu0/xLC9xZIllqP3g6jakh9HH/s1cF4ZuJPhr45FvcyCTTrkBfPX7ksTfclH+fWvdV+YZHzLXg4mU6Nf2sHuefVbhPnRH8BPEf2zwzN4V1ONY9T0otG8Ev/LSEng47j5sf9815x8d/gonhzf4g0KErpjtm5tQM/Z2Pdf9j+VdR4o0q9tri38QaIfJ13T/AJl29J4+8Z/vV6B4G+Ieh/FTRJYCIxcvGY7zTZW5CkYO31HvX6dleMw+d4NYWtpUht/X5nzdf22BxH1yj8D+Jf1+B8R5qSJBJIAx21v+PvDX/CJeMNV0kNvW2nZEb1Xqv6EVz6SFDng/Wvl6kHTk4PdH2tOSqRU1syZ7c52gFWyB8x9qY1sy8krj1zS/aXz0HtTVnZRtwGGP4hWZQPbvGiufumpRAmwN82ME/WopJmkCggfLTmuSSCUXpt/CgBxhGHAyWQ49utRzwiJwAc8ZpxuWZcYGd27d70x5mlK7j0GKAPTvgZ8MT4+8QG4vFI0axIef/pq3aMf19q+ivip42tvh14Jnmh2RXcifZrKBflw+Nu4D0Uc/981yXw38X+F/ht8JtOmuNRga6lRriS2gZXmkkJ6bf+Agc15PLe6n8dvHD3d6Tb6bbYxEp+WGLPCD3PrX2TxdDKMv9x/vJq/p/wAN08z4+dGrmOMc6ulOH4/8Oc74F+Hd741uWuJGa309W/eXDDlj/dX1NeleI/hz4e0nwhqLxWQSWCB3S4LEvvA45+td3Z2cOn2sVtbRLDDGNqRoOAK4L4vazIbG18P2QMt9qMikonXZn/2Zv5GvyxYmpiayUXZHvKpKpOyPLvAWlwvqE+rXq/8AEu0tPtEv+238Cf8AAmrB1bUptX1K4vZzumnkMjn3NdP4vvINF06Dw1YyB1gbzL6ZOk0/p9F6VxRr3Ye8+ZnfHXUKKKK0LCiiigDtvD+pW3iXTE8P6tKIXQ/8S++c/wCpc/8ALNv9hv0r0f4c+LJrWZvDOtE2+o2p2QNIceYP7ue59PUV4H0NdxpfiC08TWsGm61P9lvIF22WrE8x+iSeq/7XauLEUFUj5fkc9SnzI+h68D+Kmiy+FvFgvrF5LZLvM0bxNsKv/Hgj8/8AgVdro/xFufD8yaX4riaGZR+7v413JKvrx1/3lrnfjL4m0rXbXToNPuo7uWNndni6KMfdrz8JCrQrr+U5aUJQnboeX3NzLeTyTzyvNM7bnd23En1JqCigV7p6R1/w7+HeofEbWnsLCSGDy082WWZsBEyBnHU9a9psP2TtORB9s1+4kfHIggVB+pNeI+FdC8Tm8jvdDtryKRD8tzCTHj6NxXsWla/8W7aPD39lJ/19BHP6CvXwWMyqgrYyN36/pdHhY+ONnL/ZqiS/r1NC/wD2UNLdQbXXrqGT/ptCrj9MV438SfhfqPw11KC3vZobmK5QvDNAfvAdcqeRXq+p+IPi3dRYjv7CP3t0RT+q15D4w0TxbJcvfa9Be3TgfNcyEyqB9R0FPGY3Kq8bYSNp+v6XZOBjjYT/ANoqJrt/VjjqB1oNFeOe+SxRvPKsaAszHAHqa+m/BHhmPwr4et7QAfaGXfO3q56/98/drwb4cwwT+NdJS4IWLzt2W6bgCV/XFfRGs+ILPQYg1zJulfiO2j+aWQ/3QK8bMJSk404nBiG7qCDXdbtvD2mS3t0fkT5RGv3nPYD3NeOa/wCIJNDmudRuWDeJb9Mqi9LGI9B/v4qz4z8bSRXpuJ/Ll1NMrb2obfFZD1PrJ/KvMbm5lvJ3mmkaWWQ5Z2OSxq8HhuSN5FUaVtyJnLMxJyT1NNoor1jtCiiigAooooAKKKKAOq0Txo1rZjTNVtl1XSu0Ep+eH3jf+Grdx4Ig1iFrrw1eDUkUbnspfluY/wDgP8X/AAGuLI5FS29zLazLJE7Ryqcq6HBFZuFneOhHL1Q64tZrSVo5Y2jkXgo4wRXQ/Dr+yv8AhK7T+2Nn2XnHm/c3/wAO72qxb/EO4uoRBrljba7COA1yNsw+ko5p5tPBurcw3l5okp/guY/OjH4rzUSbcWpr7hNu1mfRKbNi7MbMcbfu4p9eF6Pp2vaSANC8V2E8X8MS3YX/AMcfpW+us/EaI4FraXH+0DEf/Zq+eng2npJfkee6P949VpG+62enevLH1v4jvwbK1i9x5Q/9nrC1fTvFeqqU1nxFZWcJ6pNeIgP/AAFOtOGCblrNAqPmYnxUOk/8JVL/AGTs2bB53lfc83ndj9K44Au2Bya686H4V0zm91ybUXH/ACy06Dav/fb/APxNO/4Tez0f5fD+kW9iw6XVx++n/wC+m4X8K+gptqKhFNnfF2VkQ6V4DvGgF9qsy6Jp458+64d/9xOrGpNU8XWtijwaEswZhiTUrps3En0/uCub1LV7zWLlp724kupj/HK241RzzV8jbvMrlvuOZyzMSck9TTaKK0LCiiigAooooAKKKKACiiigAooooAKM0UUAGT609J3j+67L9DRRQArzyMMGRj9TUeT60UUAGaKKKACiiigAooooAKKKKACiiigD/9k=';
const BG = { background: 'linear-gradient(165deg, #061220 0%, #0b1f3a 45%, #071a2e 100%)' };

const PH_SCHOOLS = [
  'University of the Philippines Diliman',
  'University of Santo Tomas (UST)',
  'De La Salle University (DLSU)',
  'Mapua University',
  'Ateneo de Manila University',
  'Polytechnic University of the Philippines',
  'University of the East',
  'Lyceum of the Philippines',
  'Adamson University',
  'St. Paul University Quezon City',
  'Far Eastern University',
  'Technological University of the Philippines',
  'Pamantasan ng Lungsod ng Maynila',
  'San Beda University',
  'National University - (Manila)',
  'Assumption College San Lorenzo',
  'Jose Rizal University',
  'Rizal Technological University',
  'Central College of the Philippines',
  'University of Perpetual Help System Dalta',
  'Colegio de San Juan de Letran Manila',
  'AMA Computer University Rankings',
  'Quezon City University',
  'Bulacan State University',
  'Ramon Magsaysay Technological University',
  'National University - (Pampanga Branch)',
  'University of the Assumption',
  'Bataan Peninsula State University',
  'Colegio de San Juan de Letran - Bataan',
  'Don Honorio Ventura State University',
  'FEU Pampanga',
  'Polytechnic University of the Philippines (PUP) - (Bulacan Branch)',
  'Columban College INC.',
  'Lyceum of Subic Bay',
  'Mondrian Aura College',
  'Gordon College',
  'Holy Angel University',
  'Nueva Ecija University of Science and Technology',
  'Asia Pacific College of Advanced Studies, Inc.',
  'Baliuag University',
  'Tarlac State University',
  'EASTWOODS Professional College of Science and Technology',
  'Angeles University Foundation',
  'Bataan Heroes College',
  'Central Luzon State University',
  'Other (please specify)',
];

export default function Landing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', school: '', course: '', email: '', phone: '' });
  const [otherSchool, setOtherSchool] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    const schoolVal = form.school === 'Other (please specify)' ? otherSchool : form.school;
    if (!schoolVal.trim()) e.school = 'School is required';
    if (!form.course.trim()) e.course = 'Course is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Valid email is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !agreed) return;

    // Reset all test progress so every new candidate starts fresh
    localStorage.setItem('matta_test_progress_v1', JSON.stringify({
      iq: 'available', english: 'locked', aptitude: 'locked',
    }));
    try {
      sessionStorage.removeItem('lastResult:iq');
      sessionStorage.removeItem('lastResult:english');
      sessionStorage.removeItem('lastResult:aptitude');
    } catch {}

    const finalSchool = form.school === 'Other (please specify)' ? otherSchool : form.school;
    sessionStorage.setItem('candidateInfo', JSON.stringify({ ...form, school: finalSchool }));
    navigate('/portal');
  };

  const ic = (f: string) =>
    `border rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm w-full
     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
     errors[f] ? 'border-red-500 bg-red-900/10' : 'border-slate-600/50 bg-slate-900/50 hover:border-slate-500'}`;

  return (
    <div className="min-h-screen text-white" style={BG}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800&family=Barlow+Condensed:wght@700;800&display=swap');
        .font-barlow { font-family: 'Barlow', sans-serif; }
        .font-barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
        select option { background: #0f172a; color: white; }
      `}</style>

      <div className="max-w-lg mx-auto px-5 py-12 font-barlow">

        {/* HERO HEADER */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl scale-110" />
            <img
              src={`data:image/jpeg;base64,${LOGO}`}
              alt="BROWAVE MATTA Logo"
              className="relative w-28 h-28 rounded-full border-[2.5px] border-emerald-400 shadow-2xl shadow-emerald-900/60"
              style={{ objectFit: 'contain', background: '#0b1f3a' }}
            />
          </div>
          <div className="text-center">
            <h1 className="font-barlow-cond font-extrabold tracking-widest uppercase"
              style={{ fontSize: '2rem', letterSpacing: '0.18em', lineHeight: 1.1 }}>
              <span className="text-white">BROWAVE</span>{' '}
              <span style={{ color: '#34d399' }}>MATTA</span>
            </h1>
            <div className="flex items-center justify-center gap-3 my-3">
              <div className="h-px w-12 bg-slate-600" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="h-px w-12 bg-slate-600" />
            </div>
            <p className="text-slate-400 tracking-widest uppercase"
              style={{ fontSize: '0.68rem', letterSpacing: '0.22em', fontWeight: 600 }}>
              MA4.0 Talent Assessment &nbsp;·&nbsp; Philippines
            </p>
            <div className="mt-3 inline-block">
              <span className="font-barlow-cond font-bold tracking-wider uppercase px-5 py-1.5
                               rounded-full border border-emerald-500/40 text-emerald-300 bg-emerald-900/25"
                style={{ fontSize: '1rem', letterSpacing: '0.12em' }}>
                General Ability Test (GAT)
              </span>
            </div>
          </div>
        </div>

        {/* INFO BANNER */}
        <div className="rounded-2xl border border-sky-700/30 bg-sky-900/10 p-4 mb-7 flex items-start gap-3">
          <svg className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-slate-300 text-sm leading-relaxed">
            Fill in your information <strong className="text-white font-semibold">once</strong> — your
            details will be automatically included in all three assessments and submitted to MA CENTER.
          </p>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/25 p-6 flex flex-col gap-4 mb-6 backdrop-blur">

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Full Name <span className="text-emerald-400">*</span>
            </label>
            <input type="text" value={form.fullName} placeholder="e.g. Maria Santos"
              onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
              className={ic('fullName')} />
            {errors.fullName && <span className="text-red-400 text-xs">{errors.fullName}</span>}
          </div>

          {/* School dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              School / University <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <select
                value={form.school}
                onChange={(e) => setForm(f => ({ ...f, school: e.target.value }))}
                className={`border rounded-xl px-4 py-3 text-sm w-full appearance-none cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all
                  ${form.school ? 'text-white' : 'text-slate-500'}
                  ${errors.school ? 'border-red-500 bg-red-900/10' : 'border-slate-600/50 bg-slate-900/50 hover:border-slate-500'}`}
              >
                <option value="" style={{ color: '#94a3b8' }}>Select your school / university</option>
                {PH_SCHOOLS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {form.school === 'Other (please specify)' && (
              <input type="text" value={otherSchool}
                placeholder="Please type your school name"
                onChange={(e) => setOtherSchool(e.target.value)}
                className={ic('school')} />
            )}
            {errors.school && <span className="text-red-400 text-xs">{errors.school}</span>}
          </div>

          {/* Course */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Course / Degree <span className="text-emerald-400">*</span>
            </label>
            <input type="text" value={form.course} placeholder="e.g. BS Business Administration"
              onChange={(e) => setForm(f => ({ ...f, course: e.target.value }))}
              className={ic('course')} />
            {errors.course && <span className="text-red-400 text-xs">{errors.course}</span>}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Email <span className="text-emerald-400">*</span>
              </label>
              <input type="email" value={form.email} placeholder="maria@email.com"
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className={ic('email')} />
              {errors.email && <span className="text-red-400 text-xs">{errors.email}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Phone <span className="text-emerald-400">*</span>
              </label>
              <input type="tel" value={form.phone} placeholder="+63 917 123 4567"
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                className={ic('phone')} />
              {errors.phone && <span className="text-red-400 text-xs">{errors.phone}</span>}
            </div>
          </div>

          {/* Consent */}
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              agreed ? 'border-emerald-600/60 bg-emerald-900/15' : 'border-slate-700/60 hover:border-slate-600'
            }`}
            onClick={() => setAgreed(!agreed)}
          >
            <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              agreed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
            }`}>
              {agreed && <span className="text-black text-xs font-black">✓</span>}
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              I confirm all information is accurate and consent to{' '}
              <strong className="text-slate-200 font-semibold">MA CENTER / MATTA</strong> storing and
              reviewing my results for recruitment purposes.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!agreed}
          className={`w-full py-4 rounded-2xl font-barlow-cond font-bold uppercase tracking-widest
            text-base transition-all ${
            agreed
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02] shadow-xl shadow-emerald-900/50'
              : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
          }`}
          style={{ letterSpacing: '0.12em' }}
        >
          Proceed to Assessment Portal
        </button>

        <p className="mt-5 text-center text-slate-600 text-xs tracking-wide">
          For fresh graduates in the Philippines · MATTA / MA4.0 Recruitment Program
        </p>
      </div>
    </div>
  );
}
