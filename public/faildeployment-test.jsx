export const onPreBuild = function({ utils }) {
    utils.build.failBuild("Intentional failure for testing");
}
